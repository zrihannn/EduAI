import React, { useState, useEffect, useRef } from 'react';
import noteService from '../services/noteService';
import { UploadCloud, FileText, Trash2, ChevronRight, X } from 'lucide-react';
import ProcessingStatusBadge from '../components/ProcessingStatusBadge';
import { CourseCard } from './Home';

const MyNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchNotes();
        // Setup polling if any notes are pending
        const interval = setInterval(() => {
            const hasPending = notes.some(n => n.processingStatus === 'PENDING' || n.processingStatus === 'PROCESSING');
            if (hasPending) fetchNotes();
        }, 5000);
        return () => clearInterval(interval);
    }, [notes]); // Minimal optimal polling approach

    const fetchNotes = async () => {
        try {
            const data = await noteService.getMyNotes();
            setNotes(data);
        } catch (error) {
            console.error("Failed to fetch notes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await noteService.uploadNote(file);
            await fetchNotes(); // Refresh list
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Ensure file is PDF, PPTX or DOCX and under 50MB");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this note?")) {
            try {
                await noteService.deleteNote(id);
                setNotes(notes.filter(n => n.id !== id));
                if (selectedNote?.id === id) setSelectedNote(null);
            } catch (e) {
                console.error("Delete failed");
            }
        }
    }

    const selectNote = async (note) => {
        setSelectedNote(note);
        if (note.processingStatus === 'DONE') {
            setLoadingRecs(true);
            try {
                const recs = await noteService.getNoteRecommendations(note.id);
                setRecommendations(recs);
            } catch (error) {
                console.error("Failed fetching recs", error);
            } finally {
                setLoadingRecs(false);
            }
        } else {
            setRecommendations([]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">

            {/* Notes List Sidebar */}
            <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                        <UploadCloud className="w-5 h-5 mr-2 text-indigo-600" />
                        My Uploads
                    </h2>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.docx,.pptx,.txt"
                    />
                    <button
                        onClick={handleUploadClick}
                        disabled={uploading}
                        className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-300 font-medium"
                    >
                        {uploading ? 'Uploading...' : 'New Note'}
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-2 space-y-2">
                    {loading && notes.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Loading notes...</div>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg m-2">
                            No notes uploaded yet.<br />Upload your first document to get started.
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => selectNote(note)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center hover:shadow-sm ${selectedNote?.id === note.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                            >
                                <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-lg mr-3">
                                    <FileText className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate" title={note.fileName}>
                                        {note.fileName}
                                    </h4>
                                    <div className="flex items-center mt-1 space-x-2">
                                        <ProcessingStatusBadge status={note.processingStatus} />
                                        <span className="text-xs text-gray-400 uppercase font-medium">{note.fileType}</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center ml-2 space-x-1">
                                    <button onClick={(e) => handleDelete(note.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Note Details Area */}
            <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full overflow-y-auto relative">
                {selectedNote ? (
                    <div>
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 break-words">{selectedNote.fileName}</h2>
                                <div className="flex items-center mt-2 space-x-3 text-sm text-gray-500">
                                    <span className="flex items-center"><ProcessingStatusBadge status={selectedNote.processingStatus} /></span>
                                    <span>Uploaded: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <a href={selectedNote.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center">
                                View Original File <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                        </div>

                        {selectedNote.processingStatus === 'DONE' && (
                            <div className="mb-6 space-y-6">
                                <div>
                                    <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-2">Key Topics Extracted</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedNote.extractedTopics?.map((topic, i) => (
                                            <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-2">Summary</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed border border-gray-100">
                                        {selectedNote.extractedText || "No summary available."}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">AI Course Recommendations</h3>

                            {selectedNote.processingStatus !== 'DONE' ? (
                                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                    <div className="animate-pulse flex flex-col items-center">
                                        <div className="w-12 h-12 bg-indigo-200 rounded-full mb-3"></div>
                                        <div className="text-gray-500 font-medium">Processing your document...</div>
                                        <div className="text-gray-400 text-sm mt-1">AI recommendations will appear here shortly.</div>
                                    </div>
                                </div>
                            ) : loadingRecs ? (
                                <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div></div>
                            ) : recommendations.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                    {recommendations.map(course => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                                    No specific courses found for these topics.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <FileText className="w-20 h-20 mb-4 text-gray-200" />
                        <h3 className="text-xl font-medium text-gray-600">No Note Selected</h3>
                        <p className="mt-2 text-center max-w-sm">Select a note from the sidebar to view its summary, extracted topics, and AI-generated course recommendations.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Extracted from original file so we can reuse it without circular dep
import { ExternalLink } from 'lucide-react';

export default MyNotes;
