import React from 'react';
import VerificationForm from '../../components/vendor/VerificationForm';
import { useToast } from '../../context/ToastContext';

const VendorVerification = () => {
    const { showToast } = useToast();

    const refresh = () => {
        showToast('Verification document uploaded successfully.', 'success');
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">Vendor Verification</h1>
            <p className="text-gray-600 mb-6">Complete your verification to unlock all features</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Why Verify?</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>✓ Increase buyer trust</li>
                        <li>✓ Get priority listings</li>
                        <li>✓ Higher visibility</li>
                        <li>✓ Featured vendor badge</li>
                    </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">Verification Status</h3>
                    <p className="text-sm text-gray-700">
                        <span className="text-yellow-600 font-semibold">⏳ Pending</span> - Upload documents to get verified
                    </p>
                </div>
            </div>

            <VerificationForm refresh={refresh} />
        </div>
    );
};

export default VendorVerification;
