const STORAGE_KEY = 'store_orders';
const getPendingSubmissionKey = (userId) => `pending_order_${userId}`;

const getLocalOrders = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};
const setLocalOrders = (orders) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const getPendingOrderSubmission = async (userId) => {
    try {
        const pending = localStorage.getItem(getPendingSubmissionKey(userId));
        return pending ? JSON.parse(pending) : null;
    } catch (e) {
        return null;
    }
};

export const clearPendingOrderSubmission = async (userId, clientOrderId = null) => {
    try {
        const key = getPendingSubmissionKey(userId);
        if (clientOrderId) {
            const pendingStr = localStorage.getItem(key);
            if (pendingStr) {
                const pending = JSON.parse(pendingStr);
                if (pending && pending.clientOrderId !== clientOrderId) {
                    return;
                }
            }
        }
        localStorage.removeItem(key);
    } catch (e) { }
};

export const createOrder = async (orderData, clientOrderId) => {
    const userId = orderData.user_id;
    if (!userId) {
        return { status: 'failed', reason: 'auth', message: 'User not authenticated' };
    }
    if (!clientOrderId) {
        return { status: 'failed', reason: 'invalid_request', message: 'Missing clientOrderId' };
    }
    
    const orderNumber = Math.floor(10000 + Math.random() * 90000).toString();
    const timestamp = new Date().toISOString();
    
    const newOrder = {
        id: clientOrderId,
        ...orderData,
        order_number: orderNumber,
        requestId: clientOrderId,
        status: 'pending',
        payment_status: 'pending',
        created_at: timestamp,
        updated_at: timestamp
    };
    
    let orders = getLocalOrders();
    orders.push(newOrder);
    setLocalOrders(orders);
    
    // Also push to dashboard orders for local test
    let dashboardOrders = JSON.parse(localStorage.getItem('dashboard_orders') || '[]');
    dashboardOrders.push(newOrder);
    localStorage.setItem('dashboard_orders', JSON.stringify(dashboardOrders));
    
    await clearPendingOrderSubmission(userId, clientOrderId);
    
    return {
        status: 'success',
        invoiceId: `ORD${orderNumber}`,
        clientOrderId,
        order: newOrder
    };
};

export const verifyOrderSubmission = async (clientOrderId, userId) => {
    if (!clientOrderId || !userId) {
        return { status: 'not_found' };
    }
    const orders = getLocalOrders();
    const found = orders.find(o => o.requestId === clientOrderId && o.user_id === userId);
    if (found) {
        return {
            status: 'found',
            order: found
        };
    }
    return { status: 'not_found' };
};
