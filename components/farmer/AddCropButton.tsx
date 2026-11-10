'use client';

import { useState } from 'react';
import AddCropModal from './AddCropModal';

export default function AddCropButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)} 
        className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
      >
        Add Crop
      </button>

      <AddCropModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
