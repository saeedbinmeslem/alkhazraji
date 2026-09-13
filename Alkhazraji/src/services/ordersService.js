const STORAGE_KEY = 'store_orders';

const getLocalOrders = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};
const setLocalOrders = (orders) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const ordersService = {
  subscribeToUserOrders(userId, callback) {
    if (!userId) throw new Error('User ID is required');

    let isCancelled = false;

    const fetchAndNotify = () => {
      let orders = getLocalOrders();
      orders = orders.filter(o => o.user_id === userId);
      orders.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      
      if (!isCancelled) {
          callback(orders);
      }
    };

    fetchAndNotify();

    let unsubscribeLifecycle;
    import('../../../shared/startup/LifecycleCoordinator.js').then(({ lifecycleCoordinator }) => {
      unsubscribeLifecycle = lifecycleCoordinator.subscribe(() => {
        if (!isCancelled) fetchAndNotify();
      });
    });

    return () => {
      isCancelled = true;
      if (unsubscribeLifecycle) unsubscribeLifecycle();
    };
  },

  async getAllUserOrders(userId) {
    if (!userId) {
      throw new Error('User ID is required to fetch orders.');
    }
    
    let orders = getLocalOrders();
    orders = orders.filter(o => o.user_id === userId);
    orders.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    
    return orders;
  },

  async injectOrderIntoCache(userId, order) {
    if (!userId || !order) return;
    let orders = getLocalOrders();
    const exists = orders.find(o => o.id === order.id || o.requestId === order.requestId);
    if (exists) {
        orders = orders.map(o => (o.id === order.id || o.requestId === order.requestId) ? order : o);
    } else {
        orders.unshift(order);
    }
    setLocalOrders(orders);
  }
};
