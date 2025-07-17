import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import EduLink from './components/homepage'
import About from './components/about'
import Header from './components/header'
import Pricing from './components/pricing'
import Contact from './components/contact'
import FindTeachers from './components/findTeachers'
import Footer from './components/footer'
import StudentPosts from './components/studentPosts'
import StudentAuth from './components/auth/StudentAuth'
import TeacherAuth from './components/auth/TeacherAuth'
import TeacherDashboard from './components/dashboard/TeacherDashboard'
import StudentDashboard from './components/StudentDashboard'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import VideoPlayer from './components/videoPlayer'
import HelpCenter from './components/helpCenter'
import Success from './components/stripr/success'
import Cancel from './components/stripr/cancel'
import PremiumSuccess from './components/stripr/premiumSucess'
import StudentPremiumSuccess from './components/stripr/studentPremiumSuccess'
import AdminDashboard from './components/dashboard/adminDashboard'
import AdminAuth from './components/auth/adminAuth'

// Protected Route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={`/login/${requiredRole}`} />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<EduLink />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/find-teachers" element={<FindTeachers />} />
            <Route path="/student-posts" element={<StudentPosts />} />
            <Route path="/login/student" element={<StudentAuth />} />
             <Route path="/login/admin" element={<AdminAuth />} />
            <Route path="/login/teacher" element={<TeacherAuth />} />
            <Route path="/register/student" element={<StudentAuth />} />
            <Route path="/register/teacher" element={<TeacherAuth />} />
            <Route path="/video-demo" element={<VideoPlayer />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/premium-success" element={<PremiumSuccess />} />
            <Route path="/student-premium-success" element={<StudentPremiumSuccess />} />
             <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/dashboard/teacher"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App