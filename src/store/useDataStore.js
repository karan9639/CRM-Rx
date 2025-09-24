import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateSeedData } from "../utils/seedData";

/**
 * @typedef {Object} Company
 * @property {string} id
 * @property {string} name
 * @property {Object} address
 * @property {string} address.line1
 * @property {string} address.city
 * @property {string} address.state
 * @property {string} address.pincode
 * @property {Array} contacts
 * @property {string} [notes]
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} companyId
 * @property {string} salespersonId
 * @property {string} dueAt - ISO string
 * @property {string} assignedByAdminId
 * @property {Object} [contactHint]
 * @property {string} [through]
 * @property {string} [notes]
 * @property {'assigned'|'in_progress'|'completed'|'missed'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} VisitReport
 * @property {string} id
 * @property {string} taskId
 * @property {string} salespersonId
 * @property {string} companyId
 * @property {Object} [checkIn]
 * @property {Object} [checkOut]
 * @property {Object} [actualContact]
 * @property {'met'|'not_available'|'rescheduled'|'closed_win'|'closed_lost'|'follow_up'} [outcome]
 * @property {number} [orderValue]
 * @property {string} [notes]
 * @property {string} [nextFollowUpAt]
 * @property {Array} [attachments]
 * @property {string} submittedAt
 */

export const useDataStore = create(
  persist(
    (set, get) => ({
      users: [],
      companies: [],
      tasks: [],
      visitReports: [],
      isInitialized: false,

      // Initialize with seed data
      initialize: () => {
        const { isInitialized } = get();
        if (!isInitialized) {
          const seedData = generateSeedData();
          set({
            users: seedData.users,
            companies: seedData.companies,
            tasks: seedData.tasks,
            visitReports: seedData.visitReports,
            isInitialized: true,
          });
        }
      },

      // Reset data
      resetData: () => {
        const seedData = generateSeedData();
        set({
          users: seedData.users,
          companies: seedData.companies,
          tasks: seedData.tasks,
          visitReports: seedData.visitReports,
          isInitialized: true,
        });
      },

      addUser: (user) => {
        const newUser = {
          ...user,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        set((state) => ({
          users: [...state.users, newUser],
        }));
        return newUser;
      },

      // Companies CRUD
      addCompany: (company) => {
        set((state) => ({
          companies: [
            ...state.companies,
            { ...company, id: Date.now().toString() },
          ],
        }));
      },

      updateCompany: (id, updates) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === id ? { ...company, ...updates } : company
          ),
        }));
      },

      // Tasks CRUD
      addTask: (task) => {
        const newTask = {
          ...task,
          id: Date.now().toString(),
          status: "assigned",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        return newTask;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      // Visit Reports CRUD
      addVisitReport: (report) => {
        const newReport = {
          ...report,
          id: Date.now().toString(),
          submittedAt: new Date().toISOString(),
        };
        set((state) => ({
          visitReports: [...state.visitReports, newReport],
        }));
        return newReport;
      },

      // Getters
      getTasksByUser: (userId) => {
        const { tasks } = get();
        return tasks.filter((task) => task.salespersonId === userId);
      },

      getTasksByCompany: (companyId) => {
        const { tasks } = get();
        return tasks.filter((task) => task.companyId === companyId);
      },

      getVisitReportsByTask: (taskId) => {
        const { visitReports } = get();
        return visitReports.filter((report) => report.taskId === taskId);
      },

      getVisitReportsByCompany: (companyId) => {
        const { visitReports } = get();
        return visitReports.filter((report) => report.companyId === companyId);
      },
    }),
    {
      name: "crm-data",
      version: 1,
    }
  )
);
