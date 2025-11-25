import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config/url';
import { useAuth } from '../../context/authContext';
import Loader from '../../components/common/Loader';
import Tickets from '../../components/dashboard/support/Tickets';
import TicketForm from '../../components/dashboard/support/TicketForm';
import TicketModal from '../../components/dashboard/support/TicketModal';

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
            <TicketForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                loading={loading}
            />

            {/* Tickets List */}
            <Tickets
                tickets={supportTickets}
                onViewTicket={handleViewTicket}
                onDeleteTicket={handleDeleteTicket}
            />

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <TicketModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                />
            )}
        </div>
    );
};

export default Support;
