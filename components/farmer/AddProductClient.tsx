'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { uploadProductImage } from '@/app/actions/upload';
import { createProductAction } from '@/app/actions/products';

export default function AddProductClient({
  crops,
}: {
  crops: { id: string; cropName: string }[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [deliveryAvail, setDeliveryAvail] = useState(false);
  const [category, setCategory] = useState('vegetables');
  const [description, setDescription] = useState('');
  const [cropId, setCropId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - photos.length);
      setPhotos([...photos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!productName || !price || !stock) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (photos.length === 0) {
      toast.error('Please upload at least one photo.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Uploading photos...');

    try {
      // 1. Upload photos
      const photoUrls: string[] = [];
      for (const file of photos) {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadProductImage(formData);
        
        if (result.success && 'url' in result) {
          photoUrls.push(result.url);
        } else {
          console.error('[Upload Error]', result.error);
          toast.error(`Failed to upload ${file.name}: ${result.error || 'Unknown error'}`);
        }
      }

      if (photoUrls.length === 0) {
        throw new Error('No photos were successfully uploaded.');
      }

      toast.loading('Creating product listing...', { id: toastId });

      // 2. Submit product data
      const productFormData = new FormData();
      productFormData.append('name', productName);
      productFormData.append('category', category.toUpperCase());
      productFormData.append('pricePerKg', price);
      productFormData.append('stockKg', stock);
      productFormData.append('deliveryAvail', deliveryAvail.toString());
      productFormData.append('photos', JSON.stringify(photoUrls));
      
      if (description) productFormData.append('description', description);
      if (cropId) productFormData.append('cropId', cropId);

      const result = await createProductAction({ success: false, error: '' }, productFormData);

      if (result.success) {
        toast.success('Product submitted for review!', { id: toastId });
        router.push('/farmer/farm-profile');
      } else {
        toast.error(result.error || 'Failed to create product.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="space-y-[32px]">
        {/* SECTION 1 - Photo Upload */}
        <div>
          <label className="text-[14px] font-medium text-on-background mb-[8px] block">Add Crop Photos (Max 5) *</label>
          
          {photos.length === 0 ? (
            <label className="border-2 border-dashed border-primary-container rounded-xl p-8 flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer group">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center mb-[8px] group-hover:bg-primary-container/20">
                <span className="material-symbols-outlined text-primary-container text-2xl">upload</span>
              </div>
              <div className="text-[16px] text-primary-container font-medium text-center">Tap to upload photos</div>
              <div className="text-[12px] text-outline mt-1">PNG, JPG up to 5MB</div>
            </label>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-[8px] overflow-x-auto pb-2">
                {photos.map((file, idx) => (
                  <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden relative flex-shrink-0">
                    <img src={URL.createObjectURL(file)} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-white rounded-full flex items-center justify-center w-5 h-5 shadow">
                      <span className="material-symbols-outlined text-[14px] text-error">close</span>
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-primary-container flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-surface-container-low transition-colors">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                    <span className="material-symbols-outlined text-primary-container">add</span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2 - Basic Details */}
        <div className="bg-surface-container-lowest p-[16px] rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)] space-y-[16px]">
          <div>
            <label className="block text-[14px] font-medium text-on-background mb-[8px]">Product Name *</label>
            <input type="text" required placeholder="e.g., Heirloom Tomatoes" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-on-background mb-[8px]">Category *</label>
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors appearance-none pr-10">
                <option value="VEGETABLES">Vegetables</option>
                <option value="FRUITS">Fruits</option>
                <option value="GRAINS">Grains</option>
                <option value="HERBS">Herbs</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-on-background mb-[8px]">Link to Farm Crop (Optional)</label>
            <div className="relative">
              <select value={cropId} onChange={(e) => setCropId(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors appearance-none pr-10">
                <option value="">-- None --</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>{crop.cropName}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-on-background mb-[8px]">Description</label>
            <textarea rows={3} placeholder="Describe the quality, farming method, and best uses..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline resize-none"></textarea>
          </div>
        </div>

        {/* SECTION 3 - Pricing & Inventory */}
        <div className="bg-surface-container-lowest p-[16px] rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)]">
          <div className="grid grid-cols-2 gap-[16px]">
            <div>
              <label className="block text-[14px] font-medium text-on-background mb-[8px]">Price per kg *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-outline">₱</span>
                <input type="number" required placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg pl-8 pr-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-on-background mb-[8px]">Available stock (kg) *</label>
              <input type="number" required placeholder="100" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
            </div>
          </div>
        </div>

        {/* SECTION 4 - Logistics */}
        <div className="bg-surface-container-lowest p-[16px] rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)] flex items-center justify-between">
          <div>
            <div className="text-[14px] font-medium text-on-background">Delivery available from farm?</div>
            <div className="text-[12px] text-on-surface-variant mt-1">Can you transport to the buyer?</div>
          </div>
          <button type="button" onClick={() => setDeliveryAvail(v => !v)} className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors ${deliveryAvail ? 'bg-primary-container' : 'bg-surface-variant'}`}>
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition transform ${deliveryAvail ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </form>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-12px_32px_rgba(27,67,50,0.08)] px-[16px] py-[16px] flex flex-col gap-[8px] md:px-[48px] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 md:w-1/2">
          {photos.length > 0 ? (
            <img src={URL.createObjectURL(photos[0])} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="Preview" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-surface-variant flex-shrink-0 flex items-center justify-center border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline">image</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold tracking-wider text-outline uppercase mb-0.5">PREVIEW LISTING</div>
            <div className="text-[14px] font-medium text-on-background truncate font-semibold">{productName || 'New Product'}</div>
            <div className="text-[12px] text-primary-container truncate">₱{price || '0.00'} / kg</div>
          </div>
        </div>
        <button 
          type="button" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full md:w-auto bg-primary-container text-on-primary hover:bg-primary-container/90 transition-colors py-3 px-6 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-lg">check_circle</span>
          )}
          {isSubmitting ? 'Publishing...' : 'Publish Listing'}
        </button>
      </div>
    </>
  );
}
