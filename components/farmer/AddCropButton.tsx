'use client';

import { useState } from 'react';
import AddCropModal from './AddCropModal';

export default function AddCropButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        className="bg-[#D4A373] text-white px-4 py-2 rounded-xl text-[14px] font-medium flex items-center gap-2 hover:bg-[#C28E5C] transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span className="hidden sm:inline">Add Crop</span>
      </button>

      <AddCropModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
