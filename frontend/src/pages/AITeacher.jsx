import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { Bot, User, Send, Trash2, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AITeacher = () => {
    const { messages, isStreaming, sendMessage, initSession, clearSession } = useChatStore();
    const { user } = useAuthStore();
    const [input, setInput] = useState('');
    const [model, setModel] = useState('gpt-4o');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        initSession();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        sendMessage(input, model);
        setInput('');
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">

                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                            <Bot className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">EduAI Teacher</h2>
                            <p className="text-xs text-gray-500 font-medium">Always here to help you understand better</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 outline-none"
                            title="Select AI Model"
                        >
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="claude-3-sonnet-20240229">Claude 3</option>
                            <option value="gemini-1.5-pro">Gemini Pro</option>
                        </select>
                        <button
                            onClick={clearSession}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Clear Chat"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
                    {messages.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                            <Sparkles className="w-16 h-16 text-indigo-200 mb-4" />
                            <p className="text-lg font-medium text-gray-600">Ask me anything about your courses!</p>
                            <p className="text-sm text-center max-w-sm mt-2">I can explain complex topics, summarize your notes, or help you study for an upcoming exam.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                    <div className="flex-shrink-0 mx-3">
                                        {msg.role === 'user' ? (
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                                <User className="w-5 h-5" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                                                <Bot className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>

                                    <div className={`mt-1 rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none prose prose-sm max-w-none'}`}>
                                        {msg.role === 'user' ? (
                                            <p className="whitespace-pre-wrap">{msg.message}</p>
                                        ) : (
                                            <ReactMarkdown>{msg.message}</ReactMarkdown>
                                        )}

                                        {msg.role === 'assistant' && msg.modelUsed && (
                                            <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider flex justify-end">
                                                {msg.modelUsed}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {isStreaming && (
                        <div className="flex justify-start">
                            <div className="flex max-w-[80%] flex-row">
                                <div className="flex-shrink-0 mx-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-1 bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSubmit} className="flex space-x-4 items-end">
                        <div className="flex-grow relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message your AI Teacher..."
                                className="w-full border border-gray-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none max-h-32 bg-slate-50"
                                rows="1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isStreaming || !input.trim()}
                            className="mb-1 p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 shadow-sm"
                        >
                            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-2 font-medium">
                        AI Teacher can make mistakes. Verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AITeacher;
