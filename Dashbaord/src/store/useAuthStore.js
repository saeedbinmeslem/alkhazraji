import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
    user: null,
    authState: 'INITIALIZING', 
    loading: false, 
    isAuthenticated: false, 
    isAuthorized: false, 
    error: null,

    login: async (email, password) => {
        set({ authState: 'AUTHENTICATING', loading: true, error: null });
        try {
            // Mock authentication
            const mockUser = {
                uid: 'admin-1',
                email: email,
                name: 'Admin',
                role: 'super_admin',
                permissions: {}
            };
            
            // Auto login for development
            setTimeout(() => {
                set({ 
                    user: mockUser, 
                    authState: 'READY',
                    loading: false, 
                    isAuthenticated: true, 
                    isAuthorized: true,
                    error: null
                });
            }, 500);

            return true;
        } catch (err) {
            set({ 
                authState: 'ERROR',
                isAuthenticated: false, 
                isAuthorized: false, 
                error: err,
                loading: false 
            });
            throw err;
        }
    },

    logout: async () => {
        set({ authState: 'INITIALIZING' }); 
        set({ 
            user: null, 
            authState: 'SIGNED_OUT',
            isAuthenticated: false, 
            isAuthorized: false, 
            error: null,
            loading: false 
        });
    },

    refreshPermissions: async () => {
        // Mock do nothing
    },
    
    hasPermission: (permission) => {
        return true;
    },

    setSession: (session) => {
        if (session) {
            set({ 
                user: session, 
                authState: 'READY',
                loading: false, 
                isAuthenticated: true, 
                isAuthorized: true,
                error: null
            });
        } else {
            set({ 
                user: null, 
                authState: 'SIGNED_OUT',
                loading: false, 
                isAuthenticated: false, 
                isAuthorized: false 
            });
        }
    },
    
    setAuthState: (newState) => {
        set({ authState: newState });
    },

    setAuthError: (error) => {
        set({ 
            authState: 'ERROR', 
            error, 
            loading: false,
            isAuthenticated: false,
            isAuthorized: false
        });
    },

    setLoading: (isLoading) => set({ loading: isLoading })
}));

export default useAuthStore;
