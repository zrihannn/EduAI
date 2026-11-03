import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import MyNotes from './pages/MyNotes';
import SavedCourses from './pages/SavedCourses';
import AITeacher from './pages/AITeacher';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/search" element={<Search />} />

                        {/* Protected Routes (Any User) */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/notes" element={<MyNotes />} />
                            <Route path="/saved" element={<SavedCourses />} />
                            <Route path="/ai-teacher" element={<AITeacher />} />
                        </Route>

                        {/* Protected Routes (Admin Only) */}
                        <Route element={<ProtectedRoute role="ADMIN" />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Route>

                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
