import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { vendorAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

const VerificationForm = ({ refresh }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!file) {
            setError('Please upload a file.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('document', file);

            await vendorAPI.uploadVerificationDocument(formData);
            setSuccess(true);
            setFile(null);
            setTimeout(() => setSuccess(false), 3000);
            showToast('Verification document uploaded successfully.', 'success');
            refresh();
        } catch (error) {
            console.error('Failed to upload document', error);
            const message = getErrorMessage(error, 'Failed to upload document. Please try again.');
            setError(message);
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg mt-6">
            <h2 className="text-xl font-semibold mb-4">Upload Verification Document</h2>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}
            {success && <div className="p-4 bg-green-100 text-green-700 rounded mb-4">Document uploaded successfully!</div>}

            <form onSubmit={submit} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="doc-input"
                        accept=".pdf,.jpg,.png,.docx"
                    />
                    <label htmlFor="doc-input" className="cursor-pointer">
                        <p className="text-gray-600">Click to select document or drag and drop</p>
                        <p className="text-sm text-gray-500">Supported: PDF, JPG, PNG, DOCX</p>
                        {file && <p className="text-sm text-blue-600 mt-2">Selected: {file.name}</p>}
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || !file}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Uploading...' : 'Upload Document'}
                </button>
            </form>
        </div>
    );
};

export default VerificationForm;
