import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import Layout from '../components/Layout';
import { 
  Bell, 
  Send, 
  Users, 
  Clock, 
  Filter,
  ChevronDown,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Notification, Student } from '../types';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  // Form state for creating notification
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    recipients: [] as string[],
    selectAll: false
  });

  // Fetch notifications and students data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch notifications
        const notificationsQuery = query(
          collection(db, 'notifications'),
          orderBy('sentAt', 'desc')
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const notificationsData = notificationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];
        
        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[];
        
        setNotifications(notificationsData);
        setStudents(studentsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load notifications data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // For demo purposes, we'll use mock data if Firebase data is not available
  useEffect(() => {
    if (isLoading && notifications.length === 0 && students.length === 0) {
      // Mock students data
      const mockStudents: Student[] = Array.from({ length: 20 }, (_, i) => ({
        id: `student-${i + 1}`,
        name: `Student ${i + 1}`,
        rollNumber: `CS${2023000 + i}`,
        department: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'][Math.floor(Math.random() * 4)],
        year: Math.floor(Math.random() * 4) + 1,
        email: `student${i + 1}@example.com`,
        phoneNumber: `123456${7890 + i}`,
        tokens: {
          breakfast: Math.floor(Math.random() * 30),
          lunch: Math.floor(Math.random() * 30),
          dinner: Math.floor(Math.random() * 30)
        }
      }));
      
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: 'notification-1',
          title: 'Missed Lunch Attendance',
          message: 'This is a reminder that you missed your lunch attendance today. Please ensure you mark your attendance for future meals.',
          recipients: mockStudents.slice(0, 5).map(s => s.id),
          sentAt: Date.now() - 3600000,
          status: 'sent'
        },
        {
          id: 'notification-2',
          title: 'Low Token Balance',
          message: 'Your meal token balance is running low. Please contact the canteen administrator to recharge your tokens.',
          recipients: mockStudents.slice(5, 10).map(s => s.id),
          sentAt: Date.now() - 86400000,
          status: 'sent'
        },
        {
          id: 'notification-3',
          title: 'Canteen Closure Notice',
          message: 'The canteen will be closed for maintenance on Saturday. Please plan accordingly.',
          recipients: mockStudents.map(s => s.id),
          sentAt: Date.now() - 172800000,
          status: 'sent'
        }
      ];
      
      setStudents(mockStudents);
      setNotifications(mockNotifications);
      setIsLoading(false);
    }
  }, [isLoading, notifications.length, students.length]);

  // Filter students based on department and year
  const filteredStudents = students.filter(student => {
    let match = true;
    
    if (departmentFilter && student.department !== departmentFilter) {
      match = false;
    }
    
    if (yearFilter && student.year !== parseInt(yearFilter)) {
      match = false;
    }
    
    return match;
  });

  // Get unique departments for filter
  const departments = [...new Set(students.map(student => student.department))];
  
  // Get unique years for filter
  const years = [...new Set(students.map(student => student.year))].sort((a, b) => a - b);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNotificationForm({
      ...notificationForm,
      [name]: value
    });
  };

  // Handle select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    
    setNotificationForm({
      ...notificationForm,
      selectAll: checked,
      recipients: checked ? filteredStudents.map(student => student.id) : []
    });
  };

  // Handle individual student selection
  const handleSelectStudent = (e: React.ChangeEvent<HTMLInputElement>, studentId: string) => {
    const { checked } = e.target;
    
    if (checked) {
      setNotificationForm({
        ...notificationForm,
        recipients: [...notificationForm.recipients, studentId]
      });
    } else {
      setNotificationForm({
        ...notificationForm,
        recipients: notificationForm.recipients.filter(id => id !== studentId),
        selectAll: false
      });
    }
  };

  // Handle meal type selection
  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner');
  };

  // Generate notification for students who missed attendance
  const generateMissedAttendanceNotification = () => {
    // In a real app, this would query the database for students who missed attendance
    // For demo purposes, we'll randomly select some students
    const randomStudents = filteredStudents
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(filteredStudents.length * 0.3));
    
    const title = `Missed ${selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Attendance`;
    const message = `This is a reminder that you missed your ${selectedMealType} attendance today. Please ensure you mark your attendance for future meals.`;
    
    setNotificationForm({
      ...notificationForm,
      title,
      message,
      recipients: randomStudents.map(student => student.id),
      selectAll: false
    });
  };

  // Handle create notification
  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!notificationForm.title || !notificationForm.message) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      if (notificationForm.recipients.length === 0) {
        toast.error('Please select at least one recipient');
        return;
      }
      
      setIsSending(true);
      
      const newNotification: Omit<Notification, 'id'> = {
        title: notificationForm.title,
        message: notificationForm.message,
        recipients: notificationForm.recipients,
        sentAt: Date.now(),
        status: 'sent'
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'notifications'), newNotification);
      
      // Update local state
      const notificationWithId: Notification = {
        id: docRef.id,
        ...newNotification
      };
      
      setNotifications([notificationWithId, ...notifications]);
      
      // Reset form
      setNotificationForm({
        title: '',
        message: '',
        recipients: [],
        selectAll: false
      });
      
      setIsCreating(false);
      toast.success('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get recipient names
  const getRecipientNames = (recipientIds: string[]) => {
    const recipientStudents = students.filter(student => recipientIds.includes(student.id));
    
    if (recipientStudents.length <= 3) {
      return recipientStudents.map(student => student.name).join(', ');
    } else {
      return `${recipientStudents.slice(0, 3).map(student => student.name).join(', ')} and ${recipientStudents.length - 3} more`;
    }
  };

  return (
    <Layout title="Notifications">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-xl font-semibold text-gray-800">Notifications Management</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Bell className="h-4 w-4 mr-2" />
              Create Notification
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {isCreating ? (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create New Notification</h3>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateNotification}>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Notification Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={notificationForm.title}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Missed Attendance Reminder"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message Content *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={notificationForm.message}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your notification message here..."
                      ></textarea>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Recipients *
                        </label>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={generateMissedAttendanceNotification}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Generate for missed attendance
                          </button>
                          
                          <select
                            value={selectedMealType}
                            onChange={handleMealTypeChange}
                            className="text-sm border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                          </select>
                          
                          <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                          >
                            <Filter className="h-4 w-4 mr-1" />
                            Filters
                            <ChevronDown className={`h-4 w-4 ml-1 transform ${showFilters ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                      
                      {showFilters && (
                        <div className="mt-2 p-3 bg-gray-100 rounded-md">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700">
                                Department
                              </label>
                              <select
                                id="departmentFilter"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">All Departments</option>
                                {departments.map((dept, index) => (
                                  <option key={index} value={dept}>{dept}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700">
                                Year
                              </label>
                              <select
                                id="yearFilter"
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">All Years</option>
                                {years.map((year, index) => (
                                  <option key={index} value={year}>Year {year}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2 border border-gray-300 rounded-md overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 flex items-center">
                          <input
                            type="checkbox"
                            id="selectAll"
                            checked={notificationForm.selectAll}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="selectAll" className="ml-2 text-sm text-gray-700">
                            Select All ({filteredStudents.length} students)
                          </label>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto p-2">
                          {filteredStudents.length === 0 ? (
                            <p className="text-sm text-gray-500 p-2">No students match the selected filters</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {filteredStudents.map((student) => (
                                <div key={student.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                                  <input
                                    type="checkbox"
                                    id={`student-${student.id}`}
                                    checked={notificationForm.recipients.includes(student.id)}
                                    onChange={(e) => handleSelectStudent(e, student.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`student-${student.id}`} className="ml-2 text-sm text-gray-700 truncate">
                                    {student.name} ({student.rollNumber})
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-700">
                          {notificationForm.recipients.length} students selected
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="h-4 w-4 mr-2" />
                          Send Notification
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notification
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No notifications found
                      </td>
                    </tr>
                  ) : (
                    notifications.map((notification) => (
                      <tr key={notification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <Bell className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">
                              {notification.recipients.length} students
                              <span className="block text-xs text-gray-400">
                                {getRecipientNames(notification.recipients)}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(notification.sentAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            notification.status === 'sent' 
                              ? 'bg-green-100 text-green-800' 
                              : notification.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {notification.status === 'sent' && <Check className="h-3 w-3 mr-1" />}
                            {notification.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {notification.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;