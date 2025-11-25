import React from "react";
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const TicketModal = ({ ticket, onClose }) => {
    if (!ticket) return null;

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: FaClock, text: 'Pending' },
            resolved: { color: 'bg-green-100 text-green-800 border-green-200', icon: FaCheckCircle, text: 'Resolved' },
            closed: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: FaTimesCircle, text: 'Closed' },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Ticket Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Subject</label>
                            <p className="text-gray-800 font-semibold mt-1">{ticket.subject}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <div className="mt-1">
                                {getStatusBadge(ticket.status)}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600">Message</label>
                            <p className="text-gray-800 mt-1 whitespace-pre-wrap">{ticket.message}</p>
                        </div>

                        {ticket.reply && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <label className="text-sm font-medium text-blue-800">Admin Reply</label>
                                <p className="text-gray-800 mt-1 whitespace-pre-wrap">{ticket.reply}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Created</label>
                                <p className="text-gray-800 mt-1">{formatDate(ticket.createdAt)}</p>
                            </div>
                            {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                    <p className="text-gray-800 mt-1">{formatDate(ticket.updatedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;