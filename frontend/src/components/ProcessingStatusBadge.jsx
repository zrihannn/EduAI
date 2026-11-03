import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

const ProcessingStatusBadge = ({ status }) => {
    switch (status) {
        case 'DONE':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Processed
                </span>
            );
        case 'PROCESSING':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-800 mr-1"></div>
                    Processing
                </span>
            );
        case 'FAILED':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Failed
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                </span>
            );
    }
};

export default ProcessingStatusBadge;
