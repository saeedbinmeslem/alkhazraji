import { products } from '../../../Alkhazraji/src/data/products.js';
import { categories } from '../../../Alkhazraji/src/data/categories.js';
import { brands } from '../../../Alkhazraji/src/data/brands.js';

export const initialData = {
    products,
    categories,
    brands,
    orders: [],
    users: [
        {
            uid: 'admin-1',
            email: 'admin@alkhazraji.local',
            displayName: 'Admin',
            role: 'super-admin'
        }
    ],
    settings: {
        storeName: 'Alkhazraji Store'
    }
};
