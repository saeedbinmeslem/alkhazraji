import { taxonomyStore } from 'shared/taxonomy';
import { initialData } from '../data/seed.js';

const STORAGE_KEY = 'dashboard_taxonomy';

const getLocalTaxonomy = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        const defaultData = {
            category: initialData.categories,
            brand: initialData.brands,
            collection: []
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
    }
    return JSON.parse(data);
};

const setLocalTaxonomy = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const taxonomyRepository = {
    getAll: async (type) => {
        const data = getLocalTaxonomy();
        return data[type] || [];
    },
    getById: async (type, id) => {
        const data = getLocalTaxonomy();
        const list = data[type] || [];
        return list.find(item => String(item.id) === String(id));
    },
    create: async (type, entityData) => {
        const data = getLocalTaxonomy();
        const list = data[type] || [];
        const newEntity = { ...entityData, id: String(Date.now()) };
        list.push(newEntity);
        data[type] = list;
        setLocalTaxonomy(data);
        return newEntity;
    },
    update: async (type, id, updates) => {
        const data = getLocalTaxonomy();
        const list = data[type] || [];
        const index = list.findIndex(item => String(item.id) === String(id));
        if (index > -1) {
            list[index] = { ...list[index], ...updates };
            data[type] = list;
            setLocalTaxonomy(data);
            return list[index];
        }
        throw new Error('Entity not found');
    },
    delete: async (type, id) => {
        const data = getLocalTaxonomy();
        let list = data[type] || [];
        list = list.filter(item => String(item.id) !== String(id));
        data[type] = list;
        setLocalTaxonomy(data);
        return true;
    }
};

export const initTaxonomyStore = async () => {
    return taxonomyStore.getState().fetchTaxonomies(taxonomyRepository);
};
