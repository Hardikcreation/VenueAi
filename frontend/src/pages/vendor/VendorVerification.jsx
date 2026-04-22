import React from 'react';
import VerificationForm from '../../components/vendor/VerificationForm';
import { useToast } from '../../context/ToastContext';

const VendorVerification = () => {
  const { showToast } = useToast();

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] bg-white p-6 shadow-[0_18px_45px_rgba(109,40,217,0.08)]">
        <h1 className="text-3xl font-extrabold text-[#22103D]">Verification Center</h1>
        <p className="mt-2 text-sm text-[#7D6F95]">Verified businesses feel safer to users and are easier for admins to review quickly.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[26px] bg-gradient-to-br from-[#EEF2FF] to-[#EDE9FE] p-5">
          <h3 className="text-lg font-bold text-[#22103D]">Why it matters</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#5C5174]">
            <li>Increase buyer trust</li>
            <li>Improve approval clarity for admin</li>
            <li>Support premium marketplace positioning</li>
            <li>Unlock stronger vendor credibility</li>
          </ul>
        </div>
        <div className="rounded-[26px] bg-gradient-to-br from-[#ECFDF5] to-[#DCFCE7] p-5">
          <h3 className="text-lg font-bold text-[#22103D]">Current status</h3>
          <p className="mt-3 text-sm font-semibold text-[#166534]">Upload your documents to keep review moving.</p>
        </div>
      </div>

      <VerificationForm refresh={() => showToast('Verification document uploaded successfully.', 'success')} />
    </div>
  );
};

export default VendorVerification;
