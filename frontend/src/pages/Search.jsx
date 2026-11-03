import React, { useEffect } from 'react';
import { useSearchStore } from '../store/searchStore';
import { CourseCard } from './Home';
import { Search as SearchIcon, Filter, Layers } from 'lucide-react';
import recommendationService from '../services/recommendationService';
import { useAuthStore } from '../store/authStore';

const Search = () => {
    const { user } = useAuthStore();
    const { query, setQuery, filters, setFilter, search, results, isLoading, pagination } = useSearchStore();

    useEffect(() => {
        search();
    }, [filters.type, filters.platform]);

    const handleSearch = (e) => {
        e.preventDefault();
        search();
    };

    const handleSave = async (id) => {
        if (!user) return alert("Please log in to save courses");
        try {
            await recommendationService.saveToList(id);
        } catch (e) {
            console.error("Failed to save", e);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <SearchIcon className="w-8 h-8 mr-3 text-indigo-600" />
                    Discover Courses
                </h1>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                    <form onSubmit={handleSearch} className="flex-grow w-full">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="What do you want to learn today?"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <SearchIcon className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                        </div>
                    </form>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex items-center space-x-2 w-1/2 md:w-auto">
                            <Filter className="text-gray-400 w-5 h-5 hidden lg:block" />
                            <select
                                className="w-full bg-slate-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filters.type}
                                onChange={(e) => setFilter('type', e.target.value)}
                            >
                                <option value="ALL">All Costs</option>
                                <option value="FREE">Free</option>
                                <option value="PAID">Paid</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 w-1/2 md:w-auto">
                            <Layers className="text-gray-400 w-5 h-5 hidden lg:block" />
                            <select
                                className="w-full bg-slate-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filters.platform}
                                onChange={(e) => setFilter('platform', e.target.value)}
                            >
                                <option value="">All Platforms</option>
                                <option value="YOUTUBE">YouTube</option>
                                <option value="COURSERA">Coursera</option>
                                <option value="UDEMY">Udemy</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors hidden md:block"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-grow">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64 border-2 border-dashed border-gray-200 rounded-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : results.length > 0 ? (
                    <div>
                        <div className="mb-4 text-sm font-medium text-gray-500">
                            Found {pagination.totalElements || results.length} recommendations
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {results.map((course) => (
                                <CourseCard key={course.id} course={course} onSave={handleSave} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-50 border-2 border-dashed border-gray-200 rounded-xl">
                        <SearchIcon className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search query or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
