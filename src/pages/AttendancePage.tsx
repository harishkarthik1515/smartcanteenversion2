import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { collection, addDoc, query, where, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Camera, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { Student } from '../types';

const AttendancePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'success' | 'error' | null>(null);
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [students, setStudents] = useState<Student[]>([]);
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Determine current meal type based on time of day
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 11) {
      setMealType('breakfast');
    } else if (currentHour >= 11 && currentHour < 16) {
      setMealType('lunch');
    } else {
      setMealType('dinner');
    }
  }, []);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const MODEL_URL = '/models';
        
        // In a real implementation, you would load models from a CDN or local files
        // For this demo, we'll simulate model loading
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate loading face-api.js models
        console.log('Face recognition models loaded');
        
        // Fetch students data
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const studentsData = studentsSnapshot.docs.map(doc => doc.data() as Student);
        setStudents(studentsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading models or student data:', error);
        toast.error('Failed to load face recognition models');
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const startCamera = () => {
    setIsCameraActive(true);
    setAttendanceStatus(null);
    setRecognizedStudent(null);
    setAttendanceMessage('');
  };

  const stopCamera = () => {
    setIsCameraActive(false);
  };

  const captureImage = async () => {
    if (!webcamRef.current) return;
    
    try {
      setIsProcessing(true);
      
      // Capture image from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }
      
      // In a real implementation, you would:
      // 1. Process the image with face-api.js
      // 2. Compare with stored face descriptors
      // 3. Identify the student
      
      // For this demo, we'll simulate face recognition with a random student
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly select a student for demo purposes
      const randomStudent = students[Math.floor(Math.random() * students.length)] || {
        id: '1',
        name: 'John Doe',
        rollNumber: 'CS2021001',
        department: 'Computer Science',
        year: 3,
        email: 'john.doe@example.com',
        phoneNumber: '1234567890',
        tokens: {
          breakfast: 10,
          lunch: 10,
          dinner: 10
        }
      };
      
      setRecognizedStudent(randomStudent);
      
      // Check if student has tokens for this meal
      if (randomStudent.tokens[mealType] <= 0) {
        setAttendanceStatus('error');
        setAttendanceMessage(`No ${mealType} tokens available for ${randomStudent.name}`);
        return;
      }
      
      // Check if student already marked attendance for this meal today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', randomStudent.id),
        where('mealType', '==', mealType),
        where('timestamp', '>=', Timestamp.fromDate(today)),
        where('timestamp', '<', Timestamp.fromDate(tomorrow))
      );
      
      const attendanceSnapshot = await getDocs(attendanceQuery);
      
      if (!attendanceSnapshot.empty) {
        setAttendanceStatus('error');
        setAttendanceMessage(`${randomStudent.name} already marked attendance for ${mealType} today`);
        return;
      }
      
      // Mark attendance and deduct token
      await addDoc(collection(db, 'attendance'), {
        studentId: randomStudent.id,
        mealType,
        timestamp: Timestamp.now(),
        date: today.toISOString().split('T')[0]
      });
      
      // Update student tokens
      const studentRef = doc(db, 'students', randomStudent.id);
      await updateDoc(studentRef, {
        [`tokens.${mealType}`]: randomStudent.tokens[mealType] - 1
      });
      
      setAttendanceStatus('success');
      setAttendanceMessage(`Attendance marked successfully for ${mealType}`);
      
      // Update local state
      const updatedStudent = {
        ...randomStudent,
        tokens: {
          ...randomStudent.tokens,
          [mealType]: randomStudent.tokens[mealType] - 1
        }
      };
      setRecognizedStudent(updatedStudent);
      
      // Update students array
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === randomStudent.id ? updatedStudent : student
        )
      );
      
    } catch (error) {
      console.error('Error processing face recognition:', error);
      setAttendanceStatus('error');
      setAttendanceMessage('Failed to process face recognition');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner');
    setAttendanceStatus(null);
    setRecognizedStudent(null);
    setAttendanceMessage('');
  };

  if (isLoading) {
    return (
      <Layout title="Attendance">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading face recognition models...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Attendance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Face Recognition</h2>
              <div className="flex items-center">
                <label htmlFor="mealType" className="mr-2 text-sm font-medium text-gray-700">
                  Meal Type:
                </label>
                <select
                  id="mealType"
                  value={mealType}
                  onChange={handleMealTypeChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              {isCameraActive ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: "user"
                    }}
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                  
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                        <p>Processing...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <Camera className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-6">Camera is currently inactive</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Start Camera
                  </button>
                </div>
              )}
            </div>

            {isCameraActive && (
              <div className="mt-6 flex justify-between">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Stop Camera
                </button>
                <button
                  onClick={captureImage}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Capture & Recognize'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recognition Results</h2>
            
            {attendanceStatus === 'success' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-sm text-green-700">{attendanceMessage}</p>
                </div>
              </div>
            )}
            
            {attendanceStatus === 'error' && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{attendanceMessage}</p>
                </div>
              </div>
            )}
            
            {recognizedStudent ? (
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-semibold mr-4">
                    {recognizedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{recognizedStudent.name}</h3>
                    <p className="text-sm text-gray-500">{recognizedStudent.rollNumber}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-base text-gray-900">{recognizedStudent.department}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Year</p>
                    <p className="text-base text-gray-900">{recognizedStudent.year}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base text-gray-900">{recognizedStudent.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Remaining Tokens</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-blue-50 p-2 rounded-md text-center">
                        <p className="text-xs text-blue-600">Breakfast</p>
                        <p className="text-lg font-semibold text-blue-800">{recognizedStudent.tokens.breakfast}</p>
                      </div>
                      <div className="bg-teal-50 p-2 rounded-md text-center">
                        <p className="text-xs text-teal-600">Lunch</p>
                        <p className="text-lg font-semibold text-teal-800">{recognizedStudent.tokens.lunch}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded-md text-center">
                        <p className="text-xs text-purple-600">Dinner</p>
                        <p className="text-lg font-semibold text-purple-800">{recognizedStudent.tokens.dinner}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <RefreshCw className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">No student recognized yet</p>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Start the camera and capture an image to recognize a student
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AttendancePage;