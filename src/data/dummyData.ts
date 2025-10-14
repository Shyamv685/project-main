export const employees = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 234 567 8900",
    position: "Senior Software Engineer",
    department: "Engineering",
    dateJoined: "2022-01-15",
    status: "Active",
    salary: 95000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah.smith@company.com",
    phone: "+1 234 567 8901",
    position: "HR Manager",
    department: "Human Resources",
    dateJoined: "2021-03-20",
    status: "Active",
    salary: 75000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael.chen@company.com",
    phone: "+1 234 567 8902",
    position: "Marketing Specialist",
    department: "Marketing",
    dateJoined: "2022-06-10",
    status: "Active",
    salary: 65000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
  },
  {
    id: 4,
    name: "Emily Johnson",
    email: "emily.johnson@company.com",
    phone: "+1 234 567 8903",
    position: "Product Designer",
    department: "Design",
    dateJoined: "2021-11-05",
    status: "Active",
    salary: 72000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
  },
  {
    id: 5,
    name: "David Lee",
    email: "david.lee@company.com",
    phone: "+1 234 567 8904",
    position: "Software Engineer",
    department: "Engineering",
    dateJoined: "2023-02-01",
    status: "Active",
    salary: 80000,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
  }
];

export const attendanceRecords = [
  { id: 1, employeeId: 1, date: "2025-10-12", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hours: 9 },
  { id: 2, employeeId: 2, date: "2025-10-12", checkIn: "08:45 AM", checkOut: "05:45 PM", status: "Present", hours: 9 },
  { id: 3, employeeId: 3, date: "2025-10-12", checkIn: "09:15 AM", checkOut: "06:15 PM", status: "Late", hours: 9 },
  { id: 4, employeeId: 4, date: "2025-10-12", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hours: 9 },
  { id: 5, employeeId: 5, date: "2025-10-12", checkIn: "09:30 AM", checkOut: "06:30 PM", status: "Late", hours: 9 },
  { id: 6, employeeId: 1, date: "2025-10-11", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hours: 9 },
  { id: 7, employeeId: 2, date: "2025-10-11", checkIn: "-", checkOut: "-", status: "Absent", hours: 0 },
  { id: 8, employeeId: 3, date: "2025-10-11", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hours: 9 },
];

export const leaveRequests = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "John Doe",
    leaveType: "Annual Leave",
    startDate: "2025-10-20",
    endDate: "2025-10-22",
    days: 3,
    reason: "Family vacation",
    status: "Approved",
    appliedDate: "2025-10-05"
  },
  {
    id: 2,
    employeeId: 3,
    employeeName: "Michael Chen",
    leaveType: "Sick Leave",
    startDate: "2025-10-15",
    endDate: "2025-10-15",
    days: 1,
    reason: "Medical appointment",
    status: "Pending",
    appliedDate: "2025-10-12"
  },
  {
    id: 3,
    employeeId: 4,
    employeeName: "Emily Johnson",
    leaveType: "Annual Leave",
    startDate: "2025-11-01",
    endDate: "2025-11-05",
    days: 5,
    reason: "Personal travel",
    status: "Pending",
    appliedDate: "2025-10-10"
  },
  {
    id: 4,
    employeeId: 2,
    employeeName: "Sarah Smith",
    leaveType: "Sick Leave",
    startDate: "2025-10-11",
    endDate: "2025-10-11",
    days: 1,
    reason: "Flu",
    status: "Approved",
    appliedDate: "2025-10-10"
  }
];

export const payrollData = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "John Doe",
    month: "October 2025",
    basicSalary: 95000,
    allowances: 5000,
    deductions: 8500,
    netSalary: 91500,
    status: "Paid"
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: "Sarah Smith",
    month: "October 2025",
    basicSalary: 75000,
    allowances: 3000,
    deductions: 6800,
    netSalary: 71200,
    status: "Paid"
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: "Michael Chen",
    month: "October 2025",
    basicSalary: 65000,
    allowances: 2500,
    deductions: 5850,
    netSalary: 61650,
    status: "Processing"
  },
  {
    id: 4,
    employeeId: 4,
    employeeName: "Emily Johnson",
    month: "October 2025",
    basicSalary: 72000,
    allowances: 3500,
    deductions: 6480,
    netSalary: 69020,
    status: "Processing"
  },
  {
    id: 5,
    employeeId: 5,
    employeeName: "David Lee",
    month: "October 2025",
    basicSalary: 80000,
    allowances: 4000,
    deductions: 7200,
    netSalary: 76800,
    status: "Pending"
  }
];

export const dashboardStats = {
  totalEmployees: 5,
  activeLeaves: 2,
  presentToday: 4,
  monthlyAttendance: 92.5,
  departmentDistribution: [
    { name: "Engineering", value: 2 },
    { name: "HR", value: 1 },
    { name: "Marketing", value: 1 },
    { name: "Design", value: 1 }
  ],
  attendanceTrend: [
    { date: "Oct 1", present: 5, absent: 0 },
    { date: "Oct 2", present: 5, absent: 0 },
    { date: "Oct 3", present: 4, absent: 1 },
    { date: "Oct 4", present: 5, absent: 0 },
    { date: "Oct 5", present: 5, absent: 0 },
    { date: "Oct 8", present: 4, absent: 1 },
    { date: "Oct 9", present: 5, absent: 0 },
    { date: "Oct 10", present: 5, absent: 0 },
    { date: "Oct 11", present: 4, absent: 1 },
    { date: "Oct 12", present: 4, absent: 1 }
  ],
  leaveTrend: [
    { month: "May", approved: 3, pending: 1, rejected: 0 },
    { month: "Jun", approved: 5, pending: 0, rejected: 1 },
    { month: "Jul", approved: 4, pending: 2, rejected: 0 },
    { month: "Aug", approved: 6, pending: 1, rejected: 0 },
    { month: "Sep", approved: 3, pending: 0, rejected: 1 },
    { month: "Oct", approved: 1, pending: 2, rejected: 0 }
  ]
};
