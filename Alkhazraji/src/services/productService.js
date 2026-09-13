import { products } from '../data/products.js';

const mockDal = {
    getLatest: async () => products,
    getBestSellers: async () => products.filter(p => p.featured),
    getPaginated: async (filters, page, pageSize) => {
        let result = products;
        if (filters) {
            // Very basic filtering mock
            if (filters.category) result = result.filter(p => p.category === filters.category);
        }
        const start = page * pageSize;
        return result.slice(start, start + pageSize);
    },
    getRelated: async (id, limitCount) => {
        const current = products.find(p => String(p.id) === String(id));
        if (!current) return products.slice(0, limitCount);
        return products.filter(p => String(p.id) !== String(id) && p.category === current.category).slice(0, limitCount);
    },
    getByIds: async (ids) => {
        return products.filter(p => ids.map(String).includes(String(p.id)));
    },
    getAvailableBrandIds: async (categoryIds) => {
        if (!categoryIds || categoryIds.length === 0) return Array.from(new Set(products.map(p => p.brandId).filter(Boolean)));
        return Array.from(new Set(products.filter(p => categoryIds.includes(p.category)).map(p => p.brandId).filter(Boolean)));
    },
    getById: async (id) => products.find(p => String(p.id) === String(id)),
    subscribeToList: (opts, callback) => {
        callback({ data: products });
        return () => {};
    },
    subscribeToLatestSWR: (limit, callback) => {
        callback(products.slice(0, limit));
        return () => {};
    },
    subscribeToBestSellersSWR: (limit, callback) => {
        callback(products.filter(p => p.featured).slice(0, limit));
        return () => {};
    },
    subscribeToRelatedSWR: (id, limitCount, callback) => {
        const current = products.find(p => String(p.id) === String(id));
        let rel = products.filter(p => String(p.id) !== String(id));
        if (current) rel = rel.filter(p => p.category === current.category);
        callback(rel.slice(0, limitCount));
        return () => {};
    },
    subscribeToPaginatedSWR: (filters, page, pageSize, cursor, callback) => {
        let result = products;
        if (filters && filters.category) result = result.filter(p => p.category === filters.category);
        const start = page * pageSize;
        callback(result.slice(start, start + pageSize));
        return () => {};
    },
    subscribeToDetailSWR: (id, callback) => {
        const current = products.find(p => String(p.id) === String(id));
        callback(current || null);
        return () => {};
    }
};

export const productRepository = mockDal;

export const fetchProductsFromFirestore = async () => mockDal.getLatest();
export const fetchFreshProductsByIds = async (ids) => mockDal.getByIds(ids);
export const fetchLatestProducts = async () => mockDal.getLatest();
export const fetchBestSellers = async () => mockDal.getBestSellers();
export const fetchProductsPaginated = async (page = 0, pageSize = 6, filters = {}, cursor = null) => {
    return mockDal.getPaginated(filters, page, pageSize);
};
export const fetchRelatedProducts = async (id, limitCount = 12) => mockDal.getRelated(id, limitCount);
export const fetchProductsByIds = async (ids) => mockDal.getByIds(ids);
export const fetchAvailableBrandIds = async (categoryIds) => mockDal.getAvailableBrandIds(categoryIds);
export const subscribeToProducts = (callback) => mockDal.subscribeToList({}, callback);
export const fetchProductById = async (id) => mockDal.getById(id);

export const subscribeToHero = (callback) => {
    // Return empty array for hero or mock
    callback([]);
    return () => {};
};

export const subscribeToLatestSWR = (callback) => mockDal.subscribeToLatestSWR(6, callback);
export const subscribeToBestSellersSWR = (callback) => mockDal.subscribeToBestSellersSWR(6, callback);
export const subscribeToRelatedSWR = (id, callback, limitCount = 12) => mockDal.subscribeToRelatedSWR(id, limitCount, callback);
export const subscribeToPaginatedSWR = (page = 0, pageSize = 6, filters = {}, cursor = null, callback) => {
    return mockDal.subscribeToPaginatedSWR(filters, page, pageSize, cursor, callback);
};
