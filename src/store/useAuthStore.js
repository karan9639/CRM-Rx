import { create } from "zustand"
import { persist } from "zustand/middleware"

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

      /**
       * Login user
       * @param {User} user
       */
      login: (user) => {
        set({ user, isAuthenticated: true })
      },

      /**
       * Logout user
       */
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      /**
       * Check if user has required role
       * @param {'admin'|'sales'} requiredRole
       * @returns {boolean}
       */
      hasRole: (requiredRole) => {
        const { user } = get()
        return user?.role === requiredRole
      },
    }),
    {
      name: "crm-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
