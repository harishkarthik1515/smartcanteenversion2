import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Bell, 
  Settings, 
  LogOut,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout, adminData } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/attendance', name: 'Attendance', icon: <Camera size={20} /> },
    { path: '/students', name: 'Students', icon: <Users size={20} /> },
    { path: '/notifications', name: 'Notifications', icon: <Bell size={20} /> },
    { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Smart Canteen</h2>
        <p className="text-blue-200 text-sm">Attendance System</p>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-blue-950 rounded-lg p-4">
          <p className="text-sm text-blue-300">Welcome,</p>
          <p className="font-medium">{adminData?.name || 'Admin'}</p>
          <p className="text-xs text-blue-300 mt-1">{adminData?.email}</p>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-800'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;