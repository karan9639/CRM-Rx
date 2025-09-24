import dayjs from "dayjs"

/**
 * Generate seed data for the CRM application
 * @returns {Object} Seed data containing users, companies, tasks, and visit reports
 */
export function generateSeedData() {
  const users = [
    {
      id: "1",
      name: "Admin User",
      role: "admin",
      phone: "+91-9876543210",
      email: "admin@crm.com",
    },
    {
      id: "2",
      name: "Rajesh Kumar",
      role: "sales",
      phone: "+91-9876543211",
      email: "rajesh@crm.com",
    },
    {
      id: "3",
      name: "Priya Sharma",
      role: "sales",
      phone: "+91-9876543212",
      email: "priya@crm.com",
    },
    {
      id: "4",
      name: "Amit Singh",
      role: "sales",
      phone: "+91-9876543213",
      email: "amit@crm.com",
    },
    {
      id: "5",
      name: "Sneha Patel",
      role: "sales",
      phone: "+91-9876543214",
      email: "sneha@crm.com",
    },
  ]

  const companies = [
    {
      id: "1",
      name: "Tech Solutions Pvt Ltd",
      address: {
        line1: "123 Business Park, Sector 18",
        city: "Gurgaon",
        state: "Haryana",
        pincode: "122015",
      },
      contacts: [
        { id: "1", name: "Vikram Gupta", role: "CEO", phone: "+91-9876543220", email: "vikram@techsolutions.com" },
        { id: "2", name: "Neha Agarwal", role: "CTO", phone: "+91-9876543221", email: "neha@techsolutions.com" },
      ],
      notes: "High-value client, interested in enterprise solutions",
    },
    {
      id: "2",
      name: "Global Manufacturing Co",
      address: {
        line1: "456 Industrial Area, Phase 2",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411019",
      },
      contacts: [
        {
          id: "3",
          name: "Ravi Mehta",
          role: "Operations Manager",
          phone: "+91-9876543222",
          email: "ravi@globalmanuf.com",
        },
      ],
      notes: "Manufacturing client, needs inventory management system",
    },
    {
      id: "3",
      name: "Retail Chain Ltd",
      address: {
        line1: "789 Commercial Complex",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      contacts: [
        {
          id: "4",
          name: "Sunita Joshi",
          role: "Store Manager",
          phone: "+91-9876543223",
          email: "sunita@retailchain.com",
        },
      ],
    },
    {
      id: "4",
      name: "Healthcare Systems",
      address: {
        line1: "321 Medical District",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
      },
      contacts: [
        { id: "5", name: "Dr. Arjun Rao", role: "Director", phone: "+91-9876543224", email: "arjun@healthcare.com" },
      ],
    },
    {
      id: "5",
      name: "Education Institute",
      address: {
        line1: "654 University Road",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
      },
      contacts: [
        {
          id: "6",
          name: "Prof. Meera Sharma",
          role: "Principal",
          phone: "+91-9876543225",
          email: "meera@education.com",
        },
      ],
    },
  ]

  const tasks = [
    // Today's tasks
    {
      id: "1",
      companyId: "1",
      salespersonId: "2",
      dueAt: dayjs().hour(10).minute(0).toISOString(),
      assignedByAdminId: "1",
      contactHint: { name: "Vikram Gupta", role: "CEO", phone: "+91-9876543220" },
      through: "LinkedIn connection",
      notes: "Demo of enterprise CRM features",
      status: "completed",
      createdAt: dayjs().subtract(1, "day").toISOString(),
      updatedAt: dayjs().subtract(2, "hours").toISOString(),
    },
    {
      id: "2",
      companyId: "2",
      salespersonId: "3",
      dueAt: dayjs().hour(14).minute(30).toISOString(),
      assignedByAdminId: "1",
      contactHint: { name: "Ravi Mehta", role: "Operations Manager" },
      notes: "Follow-up on inventory management requirements",
      status: "in_progress",
      createdAt: dayjs().subtract(1, "day").toISOString(),
      updatedAt: dayjs().subtract(1, "hour").toISOString(),
    },
    {
      id: "3",
      companyId: "3",
      salespersonId: "4",
      dueAt: dayjs().hour(16).minute(0).toISOString(),
      assignedByAdminId: "1",
      notes: "Initial meeting to understand retail requirements",
      status: "assigned",
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    },
    // Tomorrow's tasks
    {
      id: "4",
      companyId: "4",
      salespersonId: "2",
      dueAt: dayjs().add(1, "day").hour(11).minute(0).toISOString(),
      assignedByAdminId: "1",
      contactHint: { name: "Dr. Arjun Rao", role: "Director" },
      notes: "Healthcare CRM solution presentation",
      status: "assigned",
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    },
    // Past tasks
    {
      id: "5",
      companyId: "5",
      salespersonId: "5",
      dueAt: dayjs().subtract(2, "days").hour(15).minute(0).toISOString(),
      assignedByAdminId: "1",
      notes: "Education sector CRM requirements gathering",
      status: "completed",
      createdAt: dayjs().subtract(3, "days").toISOString(),
      updatedAt: dayjs().subtract(2, "days").toISOString(),
    },
  ]

  const visitReports = [
    {
      id: "1",
      taskId: "1",
      salespersonId: "2",
      companyId: "1",
      checkIn: {
        at: dayjs().subtract(2, "hours").toISOString(),
        gps: { lat: 28.4595, lng: 77.0266, accuracy: 10 },
      },
      checkOut: {
        at: dayjs().subtract(1, "hour").toISOString(),
        gps: { lat: 28.4595, lng: 77.0266, accuracy: 8 },
      },
      actualContact: {
        name: "Vikram Gupta",
        role: "CEO",
        phone: "+91-9876543220",
        email: "vikram@techsolutions.com",
      },
      outcome: "closed_win",
      orderValue: 500000,
      notes: "Successful demo. Client agreed to enterprise package. Contract to be signed next week.",
      nextFollowUpAt: dayjs().add(7, "days").toISOString(),
      submittedAt: dayjs().subtract(1, "hour").toISOString(),
    },
    {
      id: "2",
      taskId: "5",
      salespersonId: "5",
      companyId: "5",
      checkIn: {
        at: dayjs().subtract(2, "days").hour(15).toISOString(),
        gps: { lat: 28.6139, lng: 77.209, accuracy: 12 },
      },
      checkOut: {
        at: dayjs().subtract(2, "days").hour(16).minute(30).toISOString(),
        gps: { lat: 28.6139, lng: 77.209, accuracy: 15 },
      },
      actualContact: {
        name: "Prof. Meera Sharma",
        role: "Principal",
      },
      outcome: "follow_up",
      notes: "Good initial meeting. Need to prepare detailed proposal for student management system.",
      nextFollowUpAt: dayjs().add(3, "days").toISOString(),
      submittedAt: dayjs().subtract(2, "days").hour(17).toISOString(),
    },
  ]

  return { users, companies, tasks, visitReports }
}
