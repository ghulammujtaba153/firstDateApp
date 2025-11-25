import React from "react";
import { FaCheckCircle, FaClock, FaTimesCircle, FaEye, FaTrash } from 'react-icons/fa';

const Tickets = ({ tickets, onViewTicket, onDeleteTicket }) => {
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
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
                My Support Tickets ({tickets.length})
            </h2>

            {tickets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600">No support tickets yet</p>
                    <p className="text-sm text-gray-500 mt-2">Create a ticket to get help</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket._id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-800">{ticket.subject}</h3>
                                        {getStatusBadge(ticket.status)}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                        {ticket.message}
                                    </p>
                                    {ticket.reply && (
                                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-2">
                                            Admin replied
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Created: {formatDate(ticket.createdAt)}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => onViewTicket(ticket._id)}
                                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                                        title="View Details"
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        onClick={() => onDeleteTicket(ticket._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                        title="Delete Ticket"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tickets;
