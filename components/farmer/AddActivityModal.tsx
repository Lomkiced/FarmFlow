'use client';

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import toast from 'react-hot-toast';
import { createActivityAction } from '@/app/actions/activities';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-on-primary px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {pending ? 'Saving...' : 'Record Activity'}
    </button>
  );
}

export default function AddActivityModal({
  isOpen,
  onClose,
  crops,
}: {
  isOpen: boolean;
  onClose: () => void;
  crops: { id: string; cropName: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;

  async function action(formData: FormData) {
    const result = await createActivityAction({ success: false, error: '' }, formData);

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
          <h2 className="text-xl font-bold text-primary">Record Activity</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form ref={formRef} action={action} className="flex flex-col gap-4 overflow-y-auto pr-2">
          <div>
            <label htmlFor="activityType" className="block text-sm font-medium text-on-surface mb-1">
              Activity Type *
            </label>
            <select
              name="activityType"
              id="activityType"
              required
              className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="PLANTING">Planting</option>
              <option value="WATERING">Watering</option>
              <option value="FERTILIZING">Fertilizing</option>
              <option value="PEST_CONTROL">Pest Control</option>
              <option value="WEEDING">Weeding</option>
              <option value="HARVESTING">Harvesting</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="cropId" className="block text-sm font-medium text-on-surface mb-1">
              Related Crop (Optional)
            </label>
            <select
              name="cropId"
              id="cropId"
              className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- None --</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.cropName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="activityDate" className="block text-sm font-medium text-on-surface mb-1">
              Date *
            </label>
            <input
              type="date"
              name="activityDate"
              id="activityDate"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-on-surface mb-1">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={2}
              placeholder="e.g., Watered Section A"
              className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-2 border-t border-surface-variant">
            <p className="text-sm font-medium text-on-surface mb-2">Inputs Used (Optional)</p>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="inputsUsed" className="block text-xs font-medium text-on-surface-variant mb-1">
                  Input Name (e.g., Urea Fertilizer)
                </label>
                <input
                  type="text"
                  name="inputsUsed"
                  id="inputsUsed"
                  className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-xs font-medium text-on-surface-variant mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="0"
                    step="any"
                    className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-xs font-medium text-on-surface-variant mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    id="unit"
                    placeholder="kg, liters, etc."
                    className="w-full rounded-xl border border-outline-variant bg-transparent px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
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
