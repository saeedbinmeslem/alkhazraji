import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoader } from './LoaderContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, openAuthOnMount = false, onAuthMountHandled }) => {
    const { showLoader, hideLoader } = useLoader();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(prev => !prev);
    const closeMenu = () => setIsMenuOpen(false);

    const handledOnMount = useRef(false);
    useEffect(() => {
        if (openAuthOnMount && !handledOnMount.current) {
            handledOnMount.current = true;
            setIsAuthModalOpen(true);
            onAuthMountHandled?.();
        }
        
        // Auto load user
        const stored = localStorage.getItem('time-tick-user');
        if (stored) {
            setCurrentUser(JSON.parse(stored));
        }
    }, [openAuthOnMount, onAuthMountHandled]);

    const login = async (phone, password) => {
        const cleanPhone = phone.trim();
        const baseSession = {
            uid: 'user-' + cleanPhone,
            email: `phone_${cleanPhone}@Alkhazraji.store`,
            name: 'مستخدم ' + cleanPhone,
            image: '',
            role: 'user',
            permissions: {},
            phone: cleanPhone
        };
        setCurrentUser(baseSession);
        localStorage.setItem('time-tick-user', JSON.stringify(baseSession));
        setIsAuthModalOpen(false);
        return true;
    };

    const logout = async () => {
        showLoader('جاري تسجيل الخروج...');
        setCurrentUser(null);
        localStorage.removeItem('time-tick-user');
        setIsLogoutConfirmOpen(false);
        setIsProfileModalOpen(false);
        setTimeout(hideLoader, 800);
    };

    const updateUser = async (updatedData) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...updatedData };
        localStorage.setItem('time-tick-user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
    };

    const updatePassword = async (currentPassword, newPassword) => {
        return;
    };

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);
    const openLogoutConfirm = () => setIsLogoutConfirmOpen(true);
    const closeLogoutConfirm = () => setIsLogoutConfirmOpen(false);
    const openProfileModal = () => setIsProfileModalOpen(true);
    const closeProfileModal = () => setIsProfileModalOpen(false);
    const openProfilePage = () => navigate('/profile');

    return (
        <AuthContext.Provider value={{
            currentUser,
            loading,
            isAuthModalOpen,
            isLogoutConfirmOpen,
            isProfileModalOpen,
            isMenuOpen,
            setIsMenuOpen,
            toggleMenu,
            closeMenu,
            login,
            logout,
            updateUser,
            updatePassword,
            openAuthModal,
            closeAuthModal,
            openLogoutConfirm,
            closeLogoutConfirm,
            openProfileModal,
            closeProfileModal,
            openProfilePage
        }}>
            {children}
        </AuthContext.Provider>
    );
};
