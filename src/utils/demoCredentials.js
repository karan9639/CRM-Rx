/**
 * Demo user credentials for the CRM system
 * In a real application, this would be replaced with proper API authentication
 */
export const DEMO_USERS = [
  {
    id: "1",
    name: "Admin User",
    role: "admin",
    phone: "+91-9876543210",
    email: "admin@crm.com",
    password: "admin123",
  },
  {
    id: "2",
    name: "Rajesh Kumar",
    role: "sales",
    phone: "+91-9876543211",
    email: "rajesh@crm.com",
    password: "sales123",
  },
  {
    id: "3",
    name: "Priya Sharma",
    role: "sales",
    phone: "+91-9876543212",
    email: "priya@crm.com",
    password: "sales123",
  },
  {
    id: "4",
    name: "Amit Singh",
    role: "sales",
    phone: "+91-9876543213",
    email: "amit@crm.com",
    password: "sales123",
  },
  {
    id: "5",
    name: "Sneha Patel",
    role: "sales",
    phone: "+91-9876543214",
    email: "sneha@crm.com",
    password: "sales123",
  },
]

/**
 * Authenticate user with demo credentials
 * @param {string} email
 * @param {string} password
 * @returns {Object|null} User object if authenticated, null otherwise
 */
export function authenticateUser(email, password) {
  return DEMO_USERS.find((user) => user.email === email && user.password === password) || null
}

/**
 * Get user by email (for password reset, etc.)
 * @param {string} email
 * @returns {Object|null} User object if found, null otherwise
 */
export function getUserByEmail(email) {
  return DEMO_USERS.find((user) => user.email === email) || null
}
