import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/Footer';

import Home from './pages/Home';
import LearningHub from './pages/LearningHub';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ExamPanel from './pages/ExamPanel';
import InterviewPanel from './pages/InterviewPanel';
import About from './pages/About';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <ToastProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/learning-hub" element={<LearningHub />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/exam-panel" element={<ProtectedRoute><ExamPanel /></ProtectedRoute>} />
                  <Route path="/interview-panel" element={<ProtectedRoute><InterviewPanel /></ProtectedRoute>} />
                  {/* Both admin and co-admin can access /admin */}
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
