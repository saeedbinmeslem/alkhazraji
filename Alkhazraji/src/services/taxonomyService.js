import { taxonomyStore } from '../../../shared/taxonomy/index.js';
import { useStore } from 'zustand';
import { categories } from '../data/categories.js';
import { brands } from '../data/brands.js';

// Mock repository that returns static data
const mockRepository = {
    getAll: async (type) => {
        if (type === 'category') return categories;
        if (type === 'brand') return brands;
        return [];
    },
    getById: async (type, id) => {
        const list = type === 'category' ? categories : (type === 'brand' ? brands : []);
        return list.find(item => String(item.id) === String(id));
    }
};

export const initializeTaxonomies = async () => {
    if (!taxonomyStore.getState().initialized) {
        try {
            await taxonomyStore.getState().fetchTaxonomies(mockRepository);
        } catch (error) {
            console.error('Failed to initialize taxonomy store:', error);
        }
    }
};

export const refreshTaxonomies = async () => {
    try {
        await taxonomyStore.getState().fetchTaxonomies(mockRepository, { force: true });
    } catch (error) {
        console.error('Failed to refresh taxonomy store:', error);
    }
};

export const useTaxonomyStore = (selector) => {
    return useStore(taxonomyStore, selector);
};
