import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { vendorAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

const VenueForm = ({ venue, refresh }) => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        capacity: '',
        category: '',
        zone: '',
        landmark: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (venue) {
            setForm(venue);
        }
    }, [venue]);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (venue) {
                await vendorAPI.updateVenue(form);
                setSuccess(true);
                showToast('Venue updated successfully.', 'success');
            } else {
                await vendorAPI.addVenue(form);
                setSuccess(true);
                showToast('Venue created successfully.', 'success');
            }
            setTimeout(() => setSuccess(false), 3000);
            refresh();
        } catch (err) {
            console.error('Error saving venue:', err);
            const message = getErrorMessage(err, 'Failed to save venue. Please try again.');
            setError(message);
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4 mt-6 p-6 bg-gray-50 rounded-lg">
            {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}
            {success && <div className="p-4 bg-green-100 text-green-700 rounded">Venue saved successfully!</div>}

            <div>
                <label className="block text-sm font-medium">Title *</label>
                <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Venue Title"
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Description *</label>
                <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Venue Description"
                    className="w-full p-2 border rounded"
                    rows="4"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Price *</label>
                    <input
                        type="number"
                        value={form.price}
                        onChange={e => setForm({ ...form, price: e.target.value })}
                        placeholder="Price"
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Capacity</label>
                    <input
                        type="number"
                        value={form.capacity}
                        onChange={e => setForm({ ...form, capacity: e.target.value })}
                        placeholder="Capacity"
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Location *</label>
                <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="Location"
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Category</label>
                <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Select Category</option>
                    <option value="garden">Garden</option>
                    <option value="farmhouse">Farmhouse</option>
                    <option value="resort">Resort</option>
                    <option value="banquet_hall">Banquet Hall</option>
                    <option value="lawn">Lawn</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Zone</label>
                    <input
                        type="text"
                        value={form.zone}
                        onChange={e => setForm({ ...form, zone: e.target.value })}
                        placeholder="Zone"
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Landmark</label>
                    <input
                        type="text"
                        value={form.landmark}
                        onChange={e => setForm({ ...form, landmark: e.target.value })}
                        placeholder="Landmark"
                        className="w-full p-2 border rounded"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {loading ? 'Saving...' : 'Save Venue'}
            </button>
        </form>
    );
};

export default VenueForm;
