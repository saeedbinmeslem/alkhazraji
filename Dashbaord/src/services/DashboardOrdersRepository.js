import { initialData } from '../data/seed.js';
import { lifecycleCoordinator } from '../../../shared/startup/LifecycleCoordinator.js';

const STORAGE_KEY = 'dashboard_orders';

class DashboardOrdersRepository {
    constructor() {
        this.subscribers = new Map();
        this._initStorage();
    }

    _initStorage() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData.orders || []));
        }
    }

    _getOrders() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }

    _setOrders(orders) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }

    buildCacheKey(statusFilter, searchQuery, page) {
        return `dashboard_orders_${statusFilter}_q${searchQuery.trim().toLowerCase()}_p${page}`;
    }

    async getCachedOrders(cacheKey) {
        return { status: 'UNINITIALIZED', data: [], hasMore: false, lastValidatedAt: null };
    }

    async revalidateOrders(cacheKey, statusFilter, searchQuery, page, lastDocRef, cachedOrders) {
        let orders = this._getOrders();
        
        if (statusFilter !== 'all') {
            orders = orders.filter(o => o.status === statusFilter);
        }

        const rawQuery = searchQuery.trim().toLowerCase();
        if (rawQuery) {
            const numericPart = rawQuery.replace(/^ord/, '').trim();
            orders = orders.filter(o => {
                const oNum = o.order_number ? String(o.order_number).toLowerCase() : '';
                const oName = o.customer_name ? String(o.customer_name).toLowerCase() : '';
                const oPhone = o.customer_phone ? String(o.customer_phone).toLowerCase() : '';
                return oNum.includes(numericPart) || `ord${oNum}`.includes(rawQuery) || oName.includes(rawQuery) || oPhone.includes(rawQuery);
            });
        }

        orders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        const pageSize = 6;
        const start = page * pageSize;
        const paginated = orders.slice(start, start + pageSize);
        const hasMore = orders.length > start + pageSize;

        const result = {
            status: 'READY',
            data: paginated,
            hasMore,
            lastValidatedAt: new Date().toISOString(),
            lastDocRefObj: paginated.length > 0 ? paginated[paginated.length - 1] : null,
            error: null
        };

        return result;
    }

    async updateOrderStatus(orderId, newStatus) {
        let orders = this._getOrders();
        const index = orders.findIndex(o => String(o.id) === String(orderId));
        if (index > -1) {
            orders[index].status = newStatus;
            orders[index].updated_at = new Date().toISOString();
            this._setOrders(orders);
        }
    }

    async deleteOrder(orderId, orderTotal, orderStatus) {
        let orders = this._getOrders();
        orders = orders.filter(o => String(o.id) !== String(orderId));
        this._setOrders(orders);
        return { success: true, orderId };
    }

    subscribe(cacheKey, statusFilter, searchQuery, page, lastDocRef, cachedOrders, callback) {
        if (!this.subscribers.has(cacheKey)) {
            this.subscribers.set(cacheKey, new Set());
        }
        
        const subParams = { statusFilter, searchQuery, page, lastDocRef, cachedOrders, callback };
        this.subscribers.get(cacheKey).add(subParams);
        
        return () => {
            const subs = this.subscribers.get(cacheKey);
            if (subs) {
                subs.delete(subParams);
                if (subs.size === 0) this.subscribers.delete(cacheKey);
            }
        };
    }

    async _revalidateActiveSubscribers() {
        if (!this.subscribers) return;
        for (const [cacheKey, subs] of this.subscribers.entries()) {
            if (subs.size === 0) continue;
            const subParams = Array.from(subs)[0];
            try {
                const validated = await this.revalidateOrders(
                    cacheKey, 
                    subParams.statusFilter, 
                    subParams.searchQuery, 
                    subParams.page, 
                    subParams.lastDocRef, 
                    subParams.cachedOrders
                );
                if (validated) {
                    for (const s of subs) {
                        try { s.callback(validated); } catch { }
                    }
                }
            } catch (e) {
                console.warn(`[DashboardOrdersRepository] Background revalidation failed for ${cacheKey}`, e);
            }
        }
    }
}

export const dashboardOrdersRepository = new DashboardOrdersRepository();

lifecycleCoordinator.subscribe(() => {
    dashboardOrdersRepository._revalidateActiveSubscribers();
});
