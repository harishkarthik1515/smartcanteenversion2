import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Layout from '../components/Layout';
import { 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  X, 
  Check,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Student } from '../types';
import CSVReader from 'react-csv-reader';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  const studentsPerPage = 10;

  // Form state for adding/editing student
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: '',
    year: '',
    email: '',
    phoneNumber: '',
    tokens: {
      breakfast: 30,
      lunch: 30,
      dinner: 30
    }
  });

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[];
        
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students data');
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // For demo purposes, we'll use mock data if Firebase data is not available
  useEffect(() => {
    if (isLoading && students.length === 0) {
      // Mock data for demonstration
      const mockStudents: Student[] = Array.from({ length: 50 }, (_, i) => ({
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
      
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
      setIsLoading(false);
    }
  }, [isLoading, students.length]);

  // Filter students based on search term and filters
  useEffect(() => {
    let result = students;
    
    if (searchTerm) {
      result = result.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (departmentFilter) {
      result = result.filter(student => student.department === departmentFilter);
    }
    
    if (yearFilter) {
      result = result.filter(student => student.year === parseInt(yearFilter));
    }
    
    setFilteredStudents(result);
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, yearFilter, students]);

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('tokens.')) {
      const tokenType = name.split('.')[1] as 'breakfast' | 'lunch' | 'dinner';
      setFormData({
        ...formData,
        tokens: {
          ...formData.tokens,
          [tokenType]: parseInt(value) || 0
        }
      });
    } else if (name === 'year') {
      setFormData({
        ...formData,
        [name]: parseInt(value) || ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      rollNumber: '',
      department: '',
      year: '',
      email: '',
      phoneNumber: '',
      tokens: {
        breakfast: 30,
        lunch: 30,
        dinner: 30
      }
    });
  };

  // Open add student modal
  const openAddModal = () => {
    resetFormData();
    setIsAddModalOpen(true);
  };

  // Open edit student modal
  const openEditModal = (student: Student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year.toString(),
      email: student.email,
      phoneNumber: student.phoneNumber,
      tokens: {
        breakfast: student.tokens.breakfast,
        lunch: student.tokens.lunch,
        dinner: student.tokens.dinner
      }
    });
    setIsEditModalOpen(true);
  };

  // Handle add student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.name || !formData.rollNumber || !formData.department || !formData.year || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const newStudent: Omit<Student, 'id'> = {
        name: formData.name,
        rollNumber: formData.rollNumber,
        department: formData.department,
        year: parseInt(formData.year as string),
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        tokens: {
          breakfast: formData.tokens.breakfast,
          lunch: formData.tokens.lunch,
          dinner: formData.tokens.dinner
        }
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'students'), newStudent);
      
      // Update local state
      const studentWithId: Student = {
        id: docRef.id,
        ...newStudent
      };
      
      setStudents([...students, studentWithId]);
      setIsAddModalOpen(false);
      resetFormData();
      toast.success('Student added successfully');
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  // Handle edit student
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentStudent) return;
    
    try {
      // Validate form data
      if (!formData.name || !formData.rollNumber || !formData.department || !formData.year || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const updatedStudent: Omit<Student, 'id'> = {
        name: formData.name,
        rollNumber: formData.rollNumber,
        department: formData.department,
        year: parseInt(formData.year as string),
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        tokens: {
          breakfast: formData.tokens.breakfast,
          lunch: formData.tokens.lunch,
          dinner: formData.tokens.dinner
        }
      };
      
      // Update in Firestore
      await updateDoc(doc(db, 'students', currentStudent.id), updatedStudent);
      
      // Update local state
      setStudents(students.map(student => 
        student.id === currentStudent.id ? { ...student, ...updatedStudent } : student
      ));
      
      setIsEditModalOpen(false);
      setCurrentStudent(null);
      resetFormData();
      toast.success('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  // Handle delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'students', studentId));
      
      // Update local state
      setStudents(students.filter(student => student.id !== studentId));
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  // Handle CSV import
  const handleCSVImport = (data: any[], fileInfo: any) => {
    try {
      if (data.length === 0) {
        toast.error('The CSV file is empty');
        return;
      }
      
      // Process CSV data
      const processedData = data.map((row, index) => {
        // Skip header row if present
        if (index === 0 && (row[0] === 'name' || row[0] === 'Name')) return null;
        
        // Map CSV columns to student properties
        return {
          name: row[0] || '',
          rollNumber: row[1] || '',
          department: row[2] || '',
          year: parseInt(row[3]) || 1,
          email: row[4] || '',
          phoneNumber: row[5] || '',
          tokens: {
            breakfast: parseInt(row[6]) || 0,
            lunch: parseInt(row[7]) || 0,
            dinner: parseInt(row[8]) || 0
          }
        };
      }).filter(Boolean);
      
      // Validate processed data
      const validData = processedData.filter(student => 
        student && student.name && student.rollNumber && student.email
      );
      
      if (validData.length === 0) {
        toast.error('No valid student data found in the CSV file');
        return;
      }
      
      // Bulk add to Firestore (in a real app, this would be done in batches)
      Promise.all(
        validData.map(student => addDoc(collection(db, 'students'), student))
      ).then(results => {
        // Update local state with new IDs
        const newStudents = validData.map((student, index) => ({
          id: results[index].id,
          ...student
        }));
        
        setStudents([...students, ...newStudents]);
        setIsImportModalOpen(false);
        toast.success(`Successfully imported ${validData.length} students`);
      }).catch(error => {
        console.error('Error importing students:', error);
        toast.error('Failed to import students');
      });
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Failed to process CSV file');
    }
  };

  // Export students to CSV
  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Roll Number', 'Department', 'Year', 'Email', 'Phone Number', 'Breakfast Tokens', 'Lunch Tokens', 'Dinner Tokens'];
      const csvContent = [
        headers.join(','),
        ...students.map(student => [
          student.name,
          student.rollNumber,
          student.department,
          student.year,
          student.email,
          student.phoneNumber,
          student.tokens.breakfast,
          student.tokens.lunch,
          student.tokens.dinner
        ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'students.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Students data exported successfully');
    } catch (error) {
      console.error('Error exporting students:', error);
      toast.error('Failed to export students data');
    }
  };

  // Get unique departments for filter
  const departments = [...new Set(students.map(student => student.department))];
  
  // Get unique years for filter
  const years = [...new Set(students.map(student => student.year))].sort((a, b) => a - b);

  return (
    <Layout title="Students">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-xl font-semibold text-gray-800">Students Management</h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={openAddModal}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </button>
            
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </button>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Years</option>
                {years.map((year, index) => (
                  <option key={index} value={year}>Year {year}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {student.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Year {student.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            B: {student.tokens.breakfast}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800">
                            L: {student.tokens.lunch}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            D: {student.tokens.dinner}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(student)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastStudent, filteredStudents.length)}
                </span>{' '}
                of <span className="font-medium">{filteredStudents.length}</span> students
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate page numbers to show (centered around current page)
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Student</h3>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleAddStudent}>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        id="rollNumber"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                        Department *
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Chemical Engineering">Chemical Engineering</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        Year *
                      </label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="tokens.breakfast" className="block text-sm font-medium text-gray-700">
                          Breakfast Tokens
                        </label>
                        <input
                          type="number"
                          id="tokens.breakfast"
                          name="tokens.breakfast"
                          value={formData.tokens.breakfast}
                          onChange={handleInputChange}
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="tokens.lunch" className="block text-sm font-medium text-gray-700">
                          Lunch Tokens
                        </label>
                        <input
                          type="number"
                          id="tokens.lunch"
                          name="tokens.lunch"
                          value={formData.tokens.lunch}
                          onChange={handleInputChange}
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="tokens.dinner" className="block text-sm font-medium text-gray-700">
                          Dinner Tokens
                        </label>
                        <input
                          type="number"
                          id="tokens.dinner"
                          name="tokens.dinner"
                          value={formData.tokens.dinner}
                          onChange={handleInputChange}
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                    >
                      Add Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Student</h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleEditStudent}>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-rollNumber" className="block text-sm font-medium text-gray-700">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        id="edit-rollNumber"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">
                        Department *
                      </label>
                      <select
                        id="edit-department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Chemical Engineering">Chemical Engineering</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-year" className="block text-sm font-medium text-gray-700">
                        Year *
                      </label>
                      <select
                        id="edit-year"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="edit-email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="edit-phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="edit-tokens-breakfast" className="block text-sm font-medium text-gray-700">
                          Breakfast Tokens
                        </label>
                        <input
                          type="number"
                          id="edit-tokens-breakfast"
                          name="tokens.breakfast"
                          value={formData.tokens.breakfast}
                          onChange={handleInputChange}
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="edit-tokens-lunch" className="block text-sm font-medium text-gray-700">
                          Lunch Tokens
                        </label>
                        <input
                          type="number"
                          id="edit-tokens-lunch"
                          name="tokens.lunch"
                          value={formData.tokens.lunch}
                          onChange={handleInputChange}
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="edit-tokens-dinner" className="block text-sm font-medium text-gray-700">
                          Dinner Tokens
                        </label>
                        <input
                          type="number"
                          id="edit-tokens-dinner"
                          name="tokens.dinner"
                          value={formData.tokens.dinner}
                          onChange={handleInputChange}
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Import Students from CSV</h3>
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Upload a CSV file with the following columns:
                  </p>
                  <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                    <li>Name</li>
                    <li>Roll Number</li>
                    <li>Department</li>
                    <li>Year</li>
                    <li>Email</li>
                    <li>Phone Number</li>
                    <li>Breakfast Tokens (optional)</li>
                    <li>Lunch Tokens (optional)</li>
                    <li>Dinner Tokens (optional)</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <CSVReader
                    onFileLoaded={handleCSVImport}
                    parserOptions={{ header: true }}
                    cssClass="csv-reader-input"
                    cssInputClass="hidden"
                    label={
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                        <div>
                          <Upload className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700">Click to upload CSV file</p>
                          <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                        </div>
                      </div>
                    }
                  />
                </div>
                
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentsPage;