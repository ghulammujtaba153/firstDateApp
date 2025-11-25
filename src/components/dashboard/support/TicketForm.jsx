import React from "react";
import { FaPaperPlane } from 'react-icons/fa';

const TicketForm = ({ formData, onInputChange, onSubmit, loading }) => {
    return (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Support Ticket</h2>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={onInputChange}
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
                        onChange={onInputChange}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Describe your issue or question in detail..."
                        required
                    />
                </div>

                <div>
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
                </div>
            </form>
        </div>
    );
};

export default TicketForm;
