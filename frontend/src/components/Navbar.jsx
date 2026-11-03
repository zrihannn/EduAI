import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, BookOpen, Search, UploadCloud, MessageSquare, User, LayoutDashboard, Bookmark } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600" />
                            <span className="ml-2 font-bold text-xl text-gray-900">EduAI</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/search" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                <Search className="w-4 h-4 mr-1" /> Discover
                            </Link>

                            {user && (
                                <>
                                    <Link to="/notes" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        <UploadCloud className="w-4 h-4 mr-1" /> My Notes
                                    </Link>
                                    <Link to="/ai-teacher" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        <MessageSquare className="w-4 h-4 mr-1" /> AI Teacher
                                    </Link>
                                    <Link to="/saved" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        <Bookmark className="w-4 h-4 mr-1" /> Saved
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link to="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                            <LayoutDashboard className="w-4 h-4 mr-1" /> Admin
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {!user ? (
                            <div className="space-x-4">
                                <Link to="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Log in</Link>
                                <Link to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition">Sign up</Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                                    <User className="w-5 h-5 mr-1" />
                                    {user.fullName}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-sm font-medium text-red-600 hover:text-red-800"
                                >
                                    <LogOut className="w-4 h-4 mr-1" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
