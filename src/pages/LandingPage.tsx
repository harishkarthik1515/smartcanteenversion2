import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Users, 
  Bell, 
  BarChart3, 
  Shield, 
  Clock, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const features = [
    {
      icon: <Camera className="h-10 w-10 text-blue-500" />,
      title: 'Face ID Recognition',
      description: 'Seamlessly mark attendance using advanced facial recognition technology.'
    },
    {
      icon: <Users className="h-10 w-10 text-blue-500" />,
      title: 'Student Management',
      description: 'Easily import and manage student data with CSV and JSON support.'
    },
    {
      icon: <Bell className="h-10 w-10 text-blue-500" />,
      title: 'Automated Notifications',
      description: 'Send timely notifications to students who miss meal attendance.'
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-blue-500" />,
      title: 'Analytics Dashboard',
      description: 'Visualize attendance patterns and meal token usage with intuitive charts.'
    },
    {
      icon: <Shield className="h-10 w-10 text-blue-500" />,
      title: 'Secure Authentication',
      description: 'Protect your data with Firebase Authentication and role-based access control.'
    },
    {
      icon: <Clock className="h-10 w-10 text-blue-500" />,
      title: 'Real-time Updates',
      description: 'Get instant updates on attendance status and token allocation.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Camera className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Smart Canteen</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <a href="#features" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">Features</a>
              <a href="#how-it-works" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">How It Works</a>
              <Link to="/login" className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 rounded-md text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50">
                Sign Up
              </Link>
            </div>
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">How It Works</a>
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700">
                Login
              </Link>
              <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Smart Canteen</span>
                  <span className="block text-blue-600">Attendance System</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Revolutionize your canteen management with our cutting-edge Face ID attendance system. Streamline meal token allocation, track attendance, and send automated notifications.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a href="#features" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Student using face recognition"
          />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to manage canteen attendance
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our smart system combines cutting-edge technology with user-friendly interfaces to streamline canteen operations.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple, efficient, and secure
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our system is designed to be intuitive and easy to use, while providing powerful features for canteen management.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-10">
                  <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl mb-4">1</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Register Students</h3>
                  <p className="text-gray-600">Import student data via CSV or JSON files, or add students manually through the admin dashboard.</p>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Registering students" 
                    className="rounded-lg shadow-md"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pl-10">
                  <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl mb-4">2</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Face ID Setup</h3>
                  <p className="text-gray-600">Capture student facial data securely for quick and accurate identification during meal times.</p>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Face ID setup" 
                    className="rounded-lg shadow-md"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-10">
                  <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl mb-4">3</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Automated Attendance</h3>
                  <p className="text-gray-600">Students simply look at the camera during meal times, and the system automatically marks attendance and deducts meal tokens.</p>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Automated attendance" 
                    className="rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">Sign up today and transform your canteen management.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                Get started
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/login" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <Camera className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold text-white">Smart Canteen</span>
              </div>
              <p className="text-gray-400 text-base">
                Revolutionizing canteen management with cutting-edge face recognition technology.
              </p>
              <div className="flex space-x-6">
                {/* Social media links would go here */}
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Solutions</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Face Recognition</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Attendance Tracking</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Meal Token Management</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Notifications</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Documentation</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Guides</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">API Status</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Contact Us</a></li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">About</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Blog</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Careers</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Press</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Cookie Policy</a></li>
                    <li><a href="#" className="text-base text-gray-400 hover:text-white">Licensing</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2025 Smart Canteen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;