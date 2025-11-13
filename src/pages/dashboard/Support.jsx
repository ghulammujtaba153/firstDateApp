import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config/url';
import { useAuth } from '../../context/authContext';
import Loader from '../../components/common/Loader';
import { FaPaperPlane, FaCheckCircle, FaClock, FaTimesCircle, FaEye, FaTrash } from 'react-icons/fa';

const Support = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [supportTickets, setSupportTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [showForm, setShowForm] = useState(true);

    // Fetch user's support tickets
    const fetchSupportTickets = async () => {
        try {
            setLoadingTickets(true);
            const userId = user?._id || user?.id;
            
            if (!userId) {
                setSupportTickets([]);
                return;
            }

            const response = await axios.get(`${BASE_URL}/api/support/get`, {
                params: { userId }
            });
            
            setSupportTickets(response.data.supportTickets || []);
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            setError('Failed to load support tickets');
        } finally {
            setLoadingTickets(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSupportTickets();
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError('Please login to create a support ticket');
            return;
        }

        if (!formData.subject.trim() || !formData.message.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const ticketData = {
                ...formData,
                userId: user._id || user.id,
            };

            const response = await axios.post(`${BASE_URL}/api/support/create`, ticketData);
            
            if (response.data.success) {
                setSuccess('Support ticket created successfully!');
                setFormData({ subject: "", message: "" });
                // Refresh tickets list
                await fetchSupportTickets();
                // Hide form after success
                setTimeout(() => {
                    setShowForm(false);
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.response?.data?.error || 'Failed to create support ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (error) setError(null);
    };

    const handleViewTicket = async (ticketId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/support/get/${ticketId}`);
            if (response.data.success) {
                setSelectedTicket(response.data.supportTicket);
            }
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            setError('Failed to load ticket details');
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) {
            return;
        }

        try {
            const response = await axios.delete(`${BASE_URL}/api/support/delete/${ticketId}`);
            if (response.data.success) {
                setSuccess('Ticket deleted successfully');
                setSupportTickets(prev => prev.filter(ticket => ticket._id !== ticketId));
                if (selectedTicket?._id === ticketId) {
                    setSelectedTicket(null);
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete ticket');
        }
    };

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

    if (loadingTickets) {
        return <Loader />;
    }

    return (
        <div className="p-4 md:p-8 flex flex-col gap-6 bg-white shadow-xl rounded-[30px] min-h-screen">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Support Center</h1>
                <p className="text-gray-600">Get help with your account or report issues</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                    <button 
                        onClick={() => setError(null)} 
                        className="ml-2 text-red-700 hover:text-red-900"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Create Ticket Form */}
            {showForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Support Ticket</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter ticket subject"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                placeholder="Describe your issue or question in detail..."
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-bgprimary hover:text-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span>Submitting...</span>
                                ) : (
                                    <>
                                        <FaPaperPlane />
                                        <span>Submit Ticket</span>
                                    </>
                                )}
                            </button>
                            {supportTickets.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    View Tickets
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Tickets List */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        My Support Tickets ({supportTickets.length})
                    </h2>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-bgprimary hover:text-primary transition"
                        >
                            + New Ticket
                        </button>
                    )}
                </div>

                {supportTickets.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600">No support tickets yet</p>
                        <p className="text-sm text-gray-500 mt-2">Create a ticket to get help</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {supportTickets.map((ticket) => (
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
                                        <p className="text-xs text-gray-500">
                                            Created: {formatDate(ticket.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleViewTicket(ticket._id)}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTicket(ticket._id)}
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

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Ticket Details</h2>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Subject</label>
                                    <p className="text-gray-800 font-semibold mt-1">{selectedTicket.subject}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <div className="mt-1">
                                        {getStatusBadge(selectedTicket.status)}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Message</label>
                                    <p className="text-gray-800 mt-1 whitespace-pre-wrap">{selectedTicket.message}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Created</label>
                                        <p className="text-gray-800 mt-1">{formatDate(selectedTicket.createdAt)}</p>
                                    </div>
                                    {selectedTicket.updatedAt && selectedTicket.updatedAt !== selectedTicket.createdAt && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                            <p className="text-gray-800 mt-1">{formatDate(selectedTicket.updatedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;
