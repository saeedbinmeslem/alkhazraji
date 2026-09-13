import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { fetchProductsByIds, productRepository } from '../services/productService';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingFavoriteId, setLoadingFavoriteId] = useState(null);

    const openWishlist = () => navigate('/wishlist');
    
    useEffect(() => {
        const initializeFavorites = async () => {
            const saved = localStorage.getItem('time-tick-favorites');
            if (saved) {
                const parsedFavs = JSON.parse(saved);
                if (parsedFavs.length > 0) {
                    const productIds = parsedFavs.map(p => String(p?.id)).filter(Boolean);
                    try {
                        const latestProducts = await fetchProductsByIds(productIds);
                        
                        if (latestProducts && latestProducts.length > 0) {
                            const hydrated = parsedFavs.map(item => {
                                const latest = latestProducts.find(p => String(p.id) === String(item.id));
                                if (!latest) return null;
                                return {
                                    ...item,
                                    name: latest.name || item.name,
                                    price: latest.price ?? item.price,
                                    old_price: latest.old_price ?? item.old_price,
                                    imageUrl: latest.imageUrl || item.imageUrl,
                                    image: latest.imageUrl || (latest.images?.[0]) || item.image,
                                    images: latest.images ?? item.images,
                                    variants: latest.variants ?? item.variants,
                                };
                            }).filter(Boolean);
                            setFavorites(hydrated);
                            return;
                        }
                    } catch (e) {
                        console.error("Hydration error:", e);
                    }
                    setFavorites(parsedFavs);
                } else {
                    setFavorites([]);
                }
            } else {
                setFavorites([]);
            }
        };

        initializeFavorites();
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('time-tick-favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = async (product) => {
        if (loadingFavoriteId === String(product.id)) return;

        const isFav = favorites.some(fav => String(fav.id) === String(product.id));

        setLoadingFavoriteId(String(product.id));
        const newFavs = isFav 
            ? favorites.filter(fav => String(fav.id) !== String(product.id))
            : [...favorites, product];
        setFavorites(newFavs);
        localStorage.setItem('time-tick-favorites', JSON.stringify(newFavs));
        setLoadingFavoriteId(null);
    };

    const isFavorite = (productId) => favorites.some(fav => String(fav.id) === String(productId));

    const refreshFavoriteProduct = useCallback(async (productId) => {
        try {
            const data = await productRepository.getById(String(productId));
            if (!data) return null;

            const freshItem = (existingItem) => ({
                ...existingItem,
                name: data.name || existingItem.name,
                price: data.price ?? existingItem.price,
                old_price: data.old_price ?? existingItem.old_price,
                imageUrl: data.imageUrl || existingItem.imageUrl,
                image: data.imageUrl || (data.images?.[0]) || existingItem.image,
                images: data.images ?? existingItem.images,
                variants: data.variants ?? existingItem.variants,
            });

            let freshProduct = null;
            setFavorites(prev => prev.map(item => {
                if (String(item.id) !== String(productId)) return item;
                const updated = freshItem(item);
                freshProduct = updated;
                return updated;
            }));
            return freshProduct;
        } catch (err) {
            console.error('Error refreshing favorite product:', err);
            return null;
        }
    }, []);

    return (
        <FavoritesContext.Provider value={{
            favorites,
            toggleFavorite,
            isFavorite,
            isFavoritesOpen,
            setIsFavoritesOpen,
            openWishlist,
            loading,
            loadingFavoriteId,
            refreshFavoriteProduct
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};
