import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center md:justify-start space-x-6 md:order-2">
                        <Link to="/feedback" className="text-gray-400 hover:text-gray-500 text-sm">
                            Submit Feedback
                        </Link>
                        <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
                            Terms
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">
                            Privacy
                        </a>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1">
                        <p className="text-center text-sm text-gray-400 flex items-center justify-center md:justify-start">
                            &copy; {new Date().getFullYear()} EduAI Recommender. Built with <Heart className="w-4 h-4 mx-1 text-red-500" /> for AI Hackathon.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
