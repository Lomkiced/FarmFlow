'use client';

import { useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import toast from 'react-hot-toast';
import { createCropAction } from '@/app/actions/crops';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-on-primary px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {pending ? 'Saving...' : 'Add Crop'}
    </button>
  );
}

export default function AddCropModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;

  async function action(formData: FormData) {
    const result = await createCropAction(
      { success: false, error: '' }, // dummy initial state
      formData
    );

    if (result.success) {
      toast.success(result.message);
      formRef.current?.reset();
      onClose();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">Add New Crop</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form ref={formRef} action={action} className="flex flex-col gap-4 overflow-y-auto">
          <div>
            <label htmlFor="cropName" className="block text-sm font-medium text-on-surface mb-1">
              Crop Name *
            </label>
            <input
              type="text"
              name="cropName"
              id="cropName"
              required
              className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Tomatoes"
            />
          </div>

          <div>
            <label htmlFor="variety" className="block text-sm font-medium text-on-surface mb-1">
              Variety
            </label>
            <input
              type="text"
              name="variety"
              id="variety"
              className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Heirloom"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="datePlanted" className="block text-sm font-medium text-on-surface mb-1">
                Date Planted *
              </label>
              <input
                type="date"
                name="datePlanted"
                id="datePlanted"
                required
                className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="expectedHarvest" className="block text-sm font-medium text-on-surface mb-1">
                Expected Harvest *
              </label>
              <input
                type="date"
                name="expectedHarvest"
                id="expectedHarvest"
                required
                className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="areaSqm" className="block text-sm font-medium text-on-surface mb-1">
                Area (sq meters) *
              </label>
              <input
                type="number"
                name="areaSqm"
                id="areaSqm"
                required
                min="1"
                step="any"
                className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-on-surface mb-1">
                Current Stage *
              </label>
              <select
                name="stage"
                id="stage"
                required
                defaultValue="SEEDLING"
                className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="SEEDLING">Seedling</option>
                <option value="GROWING">Growing</option>
                <option value="READY_TO_HARVEST">Ready to Harvest</option>
                <option value="HARVESTED">Harvested</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-on-surface mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-surface-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
