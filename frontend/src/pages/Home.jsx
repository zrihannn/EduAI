import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSearchStore } from '../store/searchStore';
import recommendationService from '../services/recommendationService';
import { Search, ExternalLink, BookmarkPlus, BookmarkCheck, PlayCircle, Star, Sparkles, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, onSave, onRemoveItem, isSavedMode = false }) => {
    const [savedLocally, setSavedLocally] = useState(!isSavedMode && false); // Stub for actual saved state mapping

    const handleSave = async () => {
        if (isSavedMode && onRemoveItem) {
            await onRemoveItem(course.id);
            return;
        }

        if (onSave && !savedLocally) {
            await onSave(course.id);
            setSavedLocally(true);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
            <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <PlayCircle className="w-16 h-16 text-slate-300" />
                )}
                {course.courseType === 'PAID' && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">PAID</div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium flex items-center">
                    {course.platform}
                </div>
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2" title={course.title}>
                        {course.title}
                    </h3>
                </div>

                <div className="text-sm text-gray-500 mt-2 flex items-center">
                    <span className="font-medium mr-2">{course.instructor || 'Unknown Instructor'}</span>
                    {course.rating && (
                        <span className="flex items-center text-amber-500 bg-amber-50 px-1.5 rounded text-xs py-0.5 font-medium">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            {course.rating}
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {course.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    {course.relevanceScore > 0 ? (
                        <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            {Math.round(course.relevanceScore * 100)}% Match
                        </div>
                    ) : <div />}

                    <div className="flex space-x-2">
                        <button
                            onClick={handleSave}
                            className={`p-2 rounded-full transition-colors ${savedLocally || isSavedMode ? 'bg-indigo-50 text-indigo-600 hover:bg-slate-100 hover:text-red-500' : 'bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                            title={isSavedMode ? "Remove" : "Save Course"}
                        >
                            {isSavedMode ? <BookmarkCheck className="w-5 h-5 fill-current" /> : (
                                savedLocally ? <BookmarkCheck className="w-5 h-5 fill-current text-indigo-600" /> : <BookmarkPlus className="w-5 h-5" />
                            )}
                        </button>
                        <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors"
                            title="Go to Course"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Home = () => {
    const { user } = useAuthStore();
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const data = await recommendationService.getTrending();
                setTrending(data);
            } catch (error) {
                console.error("Failed to fetch trending", error);
            }
        };
        fetchTrending();
    }, []);

    const handleSave = async (id) => {
        if (!user) return alert("Please login to save courses");
        try {
            await recommendationService.saveToList(id);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <div className="bg-indigo-600 pb-20 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Unlock Your Learning Potential
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
                        Upload your lecture notes, and let EduAI instantly find the best supplementary courses across YouTube, Coursera, and Udemy tailored exactly to what you're studying.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to={user ? "/search" : "/register"} className="bg-white text-indigo-600 hover:bg-gray-50 font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 inline-flex justify-center items-center">
                            Start Discovering Courses →
                        </Link>
                        {user && (
                            <Link to="/ai-teacher" className="bg-indigo-500 text-white hover:bg-indigo-400 font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 inline-flex justify-center items-center backdrop-blur-sm">
                                Chat with AI Teacher
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Trending Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-10 w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Sparkles className="w-6 h-6 mr-2 text-indigo-500" />
                            Trending Recommended Courses
                        </h2>
                    </div>

                    {trending.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {trending.map(course => (
                                <CourseCard key={course.id} course={course} onSave={handleSave} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-gray-300">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No trending courses available right now.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export { CourseCard };
export default Home;
