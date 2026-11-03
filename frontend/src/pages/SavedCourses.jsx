import React, { useEffect, useState } from 'react';
import recommendationService from '../services/recommendationService';
import { CourseCard } from './Home';
import { Bookmark, BookOpen } from 'lucide-react';

const SavedCourses = () => {
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSaved();
    }, []);

    const fetchSaved = async () => {
        try {
            const data = await recommendationService.getSaved();
            setSaved(data);
        } catch (error) {
            console.error("Failed to fetch saved courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id) => {
        try {
            await recommendationService.removeFromList(id);
            setSaved(saved.filter(c => c.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
            <div className="mb-8 border-b border-gray-200 pb-5">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Bookmark className="w-8 h-8 mr-3 text-indigo-600" />
                    Saved Courses
                </h1>
                <p className="mt-2 text-gray-500">Your personalized learning library. Return to these courses anytime.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full"></div>
                </div>
            ) : saved.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {saved.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isSavedMode={true}
                            onRemoveItem={handleRemove}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
                    <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Your library is empty</h3>
                    <p className="text-gray-500 mt-1 mb-6 text-center max-w-sm">When you find a course you are interested in, click the save button to add it here.</p>
                </div>
            )}
        </div>
    );
};

export default SavedCourses;
