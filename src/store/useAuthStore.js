import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {'admin'|'sales'} role
 * @property {string} phone
 * @property {string} email
 */

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login user
       * @param {User} user
       */
      login: (user) => {
        console.log("[v0] Auth store: Logging in user", user.name);
        set({
          user,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        });
      },

      /**
       * Logout user
       */
      logout: () => {
        console.log("[v0] Auth store: Logging out user");
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      },

      /**
       * Set loading state
       * @param {boolean} loading
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * Set error state
       * @param {string|null} error
       */
      setError: (error) => {
        set({ error, isLoading: false });
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Check if user has required role
       * @param {'admin'|'sales'} requiredRole
       * @returns {boolean}
       */
      hasRole: (requiredRole) => {
        const { user } = get();
        return user?.role === requiredRole;
      },

      /**
       * Validate current session
       * @returns {boolean}
       */
      isValidSession: () => {
        const { user, isAuthenticated } = get();
        return isAuthenticated && user && user.id && user.email;
      },
    }),
    {
      name: "crm-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      version: 1,
    }
  )
);
