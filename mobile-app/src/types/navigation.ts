export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  ApplyJob: { jobId: string; jobTitle: string };
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Attendance: undefined;
  Leave: undefined;
  Jobs: undefined;
  Profile: undefined;
};

export type AttendanceStackParamList = {
  AttendanceMain: undefined;
  AttendanceHistory: undefined;
  AttendanceDetails: { attendanceId: string };
};

export type LeaveStackParamList = {
  LeaveMain: undefined;
  LeaveRequest: undefined;
  LeaveHistory: undefined;
  LeaveDetails: { leaveId: string };
};

export type JobStackParamList = {
  JobList: undefined;
  JobDetails: { jobId: string };
  MyApplications: undefined;
  ApplicationDetails: { applicationId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};

// Common interfaces
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'CANDIDATE';
  employeeId?: string;
  departmentId?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT';
  workingHours: number;
  overtime: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'SICK' | 'VACATION' | 'PERSONAL' | 'MATERNITY' | 'PATERNITY' | 'BEREAVEMENT';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  days: number;
  appliedAt: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  location: string;
  remoteWork: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdBy: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  candidateId: string;
  jobPostingId: string;
  resumePath: string;
  coverLetter?: string;
  status: 'APPLIED' | 'SCREENING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED' | 'SELECTED' | 'REJECTED';
  appliedAt: string;
  skills?: string[];
  fitScore?: number;
}

export interface NotificationItem {
  id: string;
  type: 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'PERFORMANCE' | 'GENERAL';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  status: 'PENDING' | 'PROCESSED' | 'PAID';
  processedAt?: string;
}
