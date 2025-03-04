import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import Layout from '../components/Layout';
import { 
  Users, 
  Utensils, 
  Bell, 
  Clock, 
  TrendingUp, 
  BarChart3,
  Calendar
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    pendingNotifications: 0,
    tokenUsage: 0,
  });

  const [attendanceData, setAttendanceData] = useState({
    labels: ['Breakfast', 'Lunch', 'Dinner'],
    datasets: [
      {
        label: 'Attendance',
        data: [0, 0, 0],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
      },
    ],
  });

  const [tokenData, setTokenData] = useState({
    labels: ['Used', 'Available'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  });

  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const totalStudents = studentsSnapshot.size;

        // Get today's date (start and end)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStart = Timestamp.fromDate(today);
        const todayEnd = Timestamp.fromDate(tomorrow);

        // Fetch today's attendance
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('timestamp', '>=', todayStart),
          where('timestamp', '<', todayEnd)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const todayAttendance = attendanceSnapshot.size;

        // Count attendance by meal type
        let breakfastCount = 0;
        let lunchCount = 0;
        let dinnerCount = 0;

        attendanceSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.mealType === 'breakfast') breakfastCount++;
          else if (data.mealType === 'lunch') lunchCount++;
          else if (data.mealType === 'dinner') dinnerCount++;
        });

        // Fetch pending notifications
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('status', '==', 'pending')
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const pendingNotifications = notificationsSnapshot.size;

        // Calculate token usage (simplified for demo)
        const tokenUsage = breakfastCount + lunchCount + dinnerCount;
        const totalPossibleTokens = totalStudents * 3; // 3 meals per day

        // Fetch recent attendance records
        const recentAttendanceQuery = query(
          collection(db, 'attendance'),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const recentAttendanceSnapshot = await getDocs(recentAttendanceQuery);
        const recentAttendanceData = await Promise.all(
          recentAttendanceSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Fetch student details
            const studentDoc = await getDocs(
              query(collection(db, 'students'), where('id', '==', data.studentId))
            );
            const studentData = studentDoc.docs[0]?.data() || { name: 'Unknown Student' };
            
            return {
              id: doc.id,
              ...data,
              studentName: studentData.name,
              timestamp: data.timestamp.toDate(),
            };
          })
        );

        // Update state
        setStats({
          totalStudents,
          todayAttendance,
          pendingNotifications,
          tokenUsage,
        });

        setAttendanceData({
          labels: ['Breakfast', 'Lunch', 'Dinner'],
          datasets: [
            {
              label: 'Attendance',
              data: [breakfastCount, lunchCount, dinnerCount],
              backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
            },
          ],
        });

        setTokenData({
          labels: ['Used', 'Available'],
          datasets: [
            {
              data: [tokenUsage, totalPossibleTokens - tokenUsage],
              backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
              borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
              borderWidth: 1,
            },
          ],
        });

        setRecentAttendance(recentAttendanceData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // For demo purposes, we'll use mock data if Firebase data is not available
  useEffect(() => {
    if (stats.totalStudents === 0) {
      // Set mock data for demonstration
      setStats({
        totalStudents: 250,
        todayAttendance: 187,
        pendingNotifications: 12,
        tokenUsage: 187,
      });

      setAttendanceData({
        labels: ['Breakfast', 'Lunch', 'Dinner'],
        datasets: [
          {
            label: 'Attendance',
            data: [65, 82, 40],
            backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
          },
        ],
      });

      setTokenData({
        labels: ['Used', 'Available'],
        datasets: [
          {
            data: [187, 563],
            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1,
          },
        ],
      });

      // Mock recent attendance data
      const mockRecentAttendance = [
        { id: '1', studentName: 'John Doe', mealType: 'lunch', timestamp: new Date() },
        { id: '2', studentName: 'Jane Smith', mealType: 'lunch', timestamp: new Date(Date.now() - 5 * 60000) },
        { id: '3', studentName: 'Michael Johnson', mealType: 'lunch', timestamp: new Date(Date.now() - 12 * 60000) },
        { id: '4', studentName: 'Emily Davis', mealType: 'lunch', timestamp: new Date(Date.now() - 18 * 60000) },
        { id: '5', studentName: 'Robert Wilson', mealType: 'lunch', timestamp: new Date(Date.now() - 25 * 60000) },
      ];
      
      setRecentAttendance(mockRecentAttendance);
    }
  }, [stats.totalStudents]);

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'lunch':
        return <Utensils className="h-5 w-5 text-teal-500" />;
      case 'dinner':
        return <Utensils className="h-5 w-5 text-purple-500" />;
      default:
        return <Utensils className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Students */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.totalStudents}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+2.5%</span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 mr-4">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Attendance</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.todayAttendance}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-500">
                {Math.round((stats.todayAttendance / stats.totalStudents) * 100)}% of students
              </span>
            </div>
          </div>
        </div>

        {/* Pending Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Notifications</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.pendingNotifications}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-500">
                Requires attention
              </span>
            </div>
          </div>
        </div>

        {/* Token Usage */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Utensils className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Token Usage Today</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.tokenUsage}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-500">
                {Math.round((stats.tokenUsage / (stats.totalStudents * 3)) * 100)}% of total tokens
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance by Meal Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Attendance by Meal</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Bar 
              data={attendanceData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }} 
            />
          </div>
        </div>

        {/* Token Usage Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Token Usage</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48">
              <Doughnut 
                data={tokenData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Attendance</h3>
          <a href="/attendance" className="text-sm text-blue-600 hover:text-blue-800">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAttendance.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {record.studentName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMealTypeIcon(record.mealType)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{record.mealType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(record.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Successful
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;