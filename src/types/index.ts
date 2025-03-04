export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: number;
  email: string;
  phoneNumber: string;
  faceData?: string;
  tokens: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  timestamp: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  recipients: string[];
  sentAt: number;
  status: 'pending' | 'sent' | 'failed';
}