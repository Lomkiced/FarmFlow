'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { uploadProductImage } from '@/app/actions/upload';
import { updateProductAction } from '@/app/actions/products';

export default function EditProductClient({
  product,
  crops,
}: {
  product: any;
  crops: { id: string; cropName: string }[];
}) {
  const router = useRouter();
  
  // Existing string URLs
  const [existingPhotos, setExistingPhotos] = useState<string[]>(product.photos || []);
  // New File objects to upload
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  
  const [productName, setProductName] = useState(product.name || '');
  const [price, setPrice] = useState(product.pricePerKg?.toString() || '');
  const [stock, setStock] = useState(product.stockKg?.toString() || '');
  const [deliveryAvail, setDeliveryAvail] = useState(product.deliveryAvail || false);
  const [category, setCategory] = useState(product.category || 'VEGETABLES');
  const [description, setDescription] = useState(product.description || '');
  const [cropId, setCropId] = useState(product.cropId || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [stockError, setStockError] = useState('');

  const totalPhotosCount = existingPhotos.length + newPhotos.length;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const addedFiles = Array.from(e.target.files).slice(0, 5 - totalPhotosCount);
      setNewPhotos([...newPhotos, ...addedFiles]);
    }
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setPriceError('');
    setStockError('');
    let hasError = false;

    if (!productName || !price || !stock) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setPriceError('Price must be greater than 0.');
      hasError = true;
    } else if (!/^\d+(\.\d{1,2})?$/.test(price)) {
      setPriceError('Price can accept up to 2 decimal places only.');
      hasError = true;
    }

    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum <= 0 || !Number.isInteger(stockNum)) {
      setStockError('Stock must be a positive whole number.');
      hasError = true;
    }

    if (hasError) return;

    if (totalPhotosCount === 0) {
      toast.error('Please have at least one photo.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Updating product...');

    try {
      // 1. Upload new photos if any
      const newlyUploadedUrls: string[] = [];
      if (newPhotos.length > 0) {
        toast.loading('Uploading new photos...', { id: toastId });
        for (const file of newPhotos) {
          const formData = new FormData();
          formData.append('file', file);
          const result = await uploadProductImage(formData);
          
          if (result.success && 'url' in result) {
            newlyUploadedUrls.push(result.url as string);
          } else {
            console.error('[Upload Error]', result.error);
            toast.error(`Failed to upload ${file.name}: ${result.error || 'Unknown error'}`, { id: toastId });
            setIsSubmitting(false);
            return;
          }
        }
      }

      const finalPhotosList = [...existingPhotos, ...newlyUploadedUrls];

      toast.loading('Saving changes...', { id: toastId });

      // 2. Submit product data
      const productFormData = new FormData();
      productFormData.append('name', productName);
      productFormData.append('category', category.toUpperCase());
      productFormData.append('pricePerKg', price);
      productFormData.append('stockKg', stock);
      productFormData.append('deliveryAvail', deliveryAvail.toString());
      productFormData.append('photos', JSON.stringify(finalPhotosList));
      
      if (description) productFormData.append('description', description);
      if (cropId) productFormData.append('cropId', cropId);

      const result = await updateProductAction(product.id, { success: false, error: '' }, productFormData);

      if (result.success) {
        toast.success(result.message || 'Product updated successfully!', { id: toastId });
        router.push('/farmer/products');
      } else {
        toast.error(result.error || 'Failed to update product.', { id: toastId });
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
          <label className="text-[14px] font-medium text-on-background mb-[8px] block">Crop Photos (Max 5) *</label>
          
          {totalPhotosCount === 0 ? (
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
                {/* Existing Photos */}
                {existingPhotos.map((url, idx) => (
                  <div key={`exist-${idx}`} className="w-20 h-20 rounded-lg overflow-hidden relative flex-shrink-0">
                    <img src={url} alt={`preview existing ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingPhoto(idx)} className="absolute top-1 right-1 bg-white rounded-full flex items-center justify-center w-5 h-5 shadow">
                      <span className="material-symbols-outlined text-[14px] text-error">close</span>
                    </button>
                  </div>
                ))}
                
                {/* New Photos */}
                {newPhotos.map((file, idx) => (
                  <div key={`new-${idx}`} className="w-20 h-20 rounded-lg overflow-hidden relative flex-shrink-0">
                    <img src={URL.createObjectURL(file)} alt={`preview new ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewPhoto(idx)} className="absolute top-1 right-1 bg-white rounded-full flex items-center justify-center w-5 h-5 shadow">
                      <span className="material-symbols-outlined text-[14px] text-error">close</span>
                    </button>
                  </div>
                ))}
                
                {/* Add More Button */}
                {totalPhotosCount < 5 && (
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
                <input type="number" required placeholder="0.00" value={price} onChange={(e) => { setPrice(e.target.value); setPriceError(''); }} className="w-full bg-background border border-outline-variant rounded-lg pl-8 pr-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
              </div>
              {priceError && <p className="text-error text-[12px] mt-1">{priceError}</p>}
            </div>
            <div>
              <label className="block text-[14px] font-medium text-on-background mb-[8px]">Available stock (kg) *</label>
              <input type="number" required placeholder="100" value={stock} onChange={(e) => { setStock(e.target.value); setStockError(''); }} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
              {stockError && <p className="text-error text-[12px] mt-1">{stockError}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 4 - Logistics */}
        <div className="bg-surface-container-lowest p-[16px] rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)] flex items-center justify-between">
          <div>
            <div className="text-[14px] font-medium text-on-background">Delivery available from farm?</div>
            <div className="text-[12px] text-on-surface-variant mt-1">Can you transport to the buyer?</div>
          </div>
          <button type="button" onClick={() => setDeliveryAvail((v: boolean) => !v)} className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors ${deliveryAvail ? 'bg-primary-container' : 'bg-surface-variant'}`}>
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition transform ${deliveryAvail ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </form>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-12px_32px_rgba(27,67,50,0.08)] px-[16px] py-[16px] flex flex-col gap-[8px] md:px-[48px] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 md:w-1/2">
          {existingPhotos.length > 0 ? (
            <img src={existingPhotos[0]} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="Preview" />
          ) : newPhotos.length > 0 ? (
            <img src={URL.createObjectURL(newPhotos[0])} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="Preview" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-surface-variant flex-shrink-0 flex items-center justify-center border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline">image</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold tracking-wider text-outline uppercase mb-0.5">EDITING LISTING</div>
            <div className="text-[14px] font-medium text-on-background truncate font-semibold">{productName || 'Unnamed Product'}</div>
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
            <span className="material-symbols-outlined text-lg">save</span>
          )}
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  );
}
