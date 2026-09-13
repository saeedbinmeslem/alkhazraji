import { deleteFromCloudinary } from '../utils/cloudinary';
import { initialData } from '../data/seed.js';

const STORAGE_KEY = 'dashboard_products';

const getLocalProducts = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData.products));
        return initialData.products;
    }
    return JSON.parse(data);
};

const setLocalProducts = (products) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

const mockDal = {
    getPaginated: async (filters, page, pageSize) => {
        const products = getLocalProducts();
        return products;
    },
    getStats: async () => {
        const products = getLocalProducts();
        return { total: products.length, active: products.length };
    },
    getAvailableBrandIds: async (categoryIds) => {
        const products = getLocalProducts();
        if (!categoryIds || categoryIds.length === 0) return Array.from(new Set(products.map(p => p.brandId).filter(Boolean)));
        return Array.from(new Set(products.filter(p => categoryIds.includes(p.category)).map(p => p.brandId).filter(Boolean)));
    },
    create: async (productData) => {
        const products = getLocalProducts();
        const newProduct = { ...productData, id: String(Date.now()), displayId: String(Date.now()).slice(-4) };
        products.push(newProduct);
        setLocalProducts(products);
        return newProduct;
    },
    update: async (id, updates) => {
        const products = getLocalProducts();
        const index = products.findIndex(p => String(p.id) === String(id));
        if (index > -1) {
            products[index] = { ...products[index], ...updates };
            setLocalProducts(products);
            return products[index];
        }
        throw new Error('Product not found');
    },
    delete: async (id) => {
        let products = getLocalProducts();
        products = products.filter(p => String(p.id) !== String(id));
        setLocalProducts(products);
        return true;
    },
    deleteMany: async (ids) => {
        let products = getLocalProducts();
        const idsStr = ids.map(String);
        products = products.filter(p => !idsStr.includes(String(p.id)));
        setLocalProducts(products);
        return { failedIds: [], deletedIds: ids, errors: [] };
    },
    getByIds: async (ids) => {
        const products = getLocalProducts();
        return products.filter(p => ids.map(String).includes(String(p.id)));
    },
    subscribeToStatsSWR: (callback) => {
        const products = getLocalProducts();
        callback({ total: products.length, active: products.length });
        return () => {};
    },
    getFilteredIds: async (filters, cap) => {
        const products = getLocalProducts();
        return { ids: products.map(p => p.id), capped: false };
    }
};

export const productRepository = mockDal;
export const fetchProductsFromFirestore = async () => mockDal.getPaginated({}, 0, 100);
export const fetchStats = async () => mockDal.getStats();
export const getAvailableBrandIds = async (categoryIds) => mockDal.getAvailableBrandIds(categoryIds);
export const addProduct = async (productData) => mockDal.create(productData);
export const updateProduct = async (id, updates) => mockDal.update(id, updates);
export const deleteProduct = async (id) => mockDal.delete(id);
export const subscribeToStatsSWR = (callback) => mockDal.subscribeToStatsSWR(callback);
export const getFilteredIds = async (filters, cap = 500) => mockDal.getFilteredIds(filters, cap);

export const deleteProducts = async (ids) => {
    if (!ids || ids.length === 0) {
        throw new Error('لا يوجد منتجات محددة للحذف');
    }
    const cloudinaryErrors = [];
    let products = [];
    try {
        products = await productRepository.getByIds(ids);
    } catch (fetchErr) {
        console.warn('[deleteProducts] Could not batch-fetch products for asset cleanup:', fetchErr);
    }
    const productMap = new Map(products.map(p => [String(p.id), p]));
    for (const id of ids) {
        const product = productMap.get(String(id));
        if (!product) continue;
        try {
            if (product.video && product.video.includes('cloudinary')) {
                await deleteFromCloudinary(product.video, 'video');
            }
            const imagesToDelete = new Set(product.images || []);
            if (product.imageUrl) imagesToDelete.add(product.imageUrl);
            for (const img of imagesToDelete) {
                if (img && img.includes('cloudinary')) {
                    await deleteFromCloudinary(img, 'image');
                }
            }
        } catch (cdnErr) {
            cloudinaryErrors.push({ id, message: cdnErr?.message || 'Cloudinary error' });
        }
    }
    const result = await productRepository.deleteMany(ids);
    return {
        success: result.failedIds.length === 0,
        deletedIds: result.deletedIds,
        failedIds: result.failedIds,
        errors: result.errors,
        cloudinaryErrors
    };
};
