'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { uploadProductImage } from '@/app/actions/upload';
import { createProductAction } from '@/app/actions/products';
import { PRODUCT_CATEGORIES } from '@/lib/validations/product';

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
  const [minOrderQty, setMinOrderQty] = useState('0.25');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [wholesaleMinQty, setWholesaleMinQty] = useState('');
  const [deliveryAvail, setDeliveryAvail] = useState(false);
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [cropId, setCropId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [stockError, setStockError] = useState('');
  const [moqError, setMoqError] = useState('');
  const [wholesaleError, setWholesaleError] = useState('');

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
    setPriceError('');
    setStockError('');
    setMoqError('');
    setWholesaleError('');
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
    if (isNaN(stockNum) || stockNum <= 0) {
      setStockError('Stock must be a positive number.');
      hasError = true;
    }

    const moqNum = Number(minOrderQty);
    if (isNaN(moqNum) || moqNum < 0.25) {
      setMoqError('Minimum order quantity must be at least 0.25 kg.');
      hasError = true;
    }

    if (wholesalePrice) {
      const wpNum = parseFloat(wholesalePrice);
      if (isNaN(wpNum) || wpNum <= 0) {
        setWholesaleError('Wholesale price must be greater than ₱0.');
        hasError = true;
      }
    }

    if (wholesaleMinQty) {
      const wmqNum = Number(wholesaleMinQty);
      if (isNaN(wmqNum) || wmqNum < 0.25) {
        setWholesaleError('Wholesale minimum quantity must be at least 0.25 kg.');
        hasError = true;
      }
    }

    if (hasError) return;

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
      productFormData.append('category', category);
      productFormData.append('pricePerKg', price);
      productFormData.append('stockKg', stock);
      productFormData.append('minOrderQty', minOrderQty || '1');
      if (wholesalePrice) productFormData.append('wholesalePrice', wholesalePrice);
      if (wholesaleMinQty) productFormData.append('wholesaleMinQty', wholesaleMinQty);
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
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
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

        {/* SECTION 3 - Pricing, MOQ & Wholesale */}
        <div className="bg-surface-container-lowest p-[16px] rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)] space-y-[16px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
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
              <input type="number" step="0.25" min="0.01" required placeholder="100" value={stock} onChange={(e) => { setStock(e.target.value); setStockError(''); }} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
              {stockError && <p className="text-error text-[12px] mt-1">{stockError}</p>}
            </div>
            <div>
              <label className="block text-[14px] font-medium text-on-background mb-[8px]">Minimum Order Qty (MOQ) *</label>
              <div className="relative">
                <input type="number" step="0.25" min="0.25" required placeholder="0.25" value={minOrderQty} onChange={(e) => { setMinOrderQty(e.target.value); setMoqError(''); }} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-outline font-medium">kg</span>
              </div>
              {moqError && <p className="text-error text-[12px] mt-1">{moqError}</p>}
              <p className="text-[11px] text-on-surface-variant mt-1">
                Smallest quantity a customer can order. <span className="text-primary font-medium">Tip: For kg products, you can set 0.25 (1/4 kg) or 0.5 (1/2 kg) to allow buyers to purchase fractional kilos.</span>
              </p>
            </div>
          </div>

          {/* Wholesale Pricing Tier (Optional) */}
          <div className="pt-4 border-t border-outline-variant/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span className="text-[14px] font-semibold text-on-background">Wholesale Pricing (Bulk Tier / Contract Discount)</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Optional</span>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-3">
              Offer a discounted rate for bulk buyers or scheduled recurring wholesale contracts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div>
                <label className="block text-[13px] font-medium text-on-background mb-[6px]">Wholesale Price (per kg)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-outline">₱</span>
                  <input type="number" placeholder="Discounted price (e.g. 80.00)" value={wholesalePrice} onChange={(e) => { setWholesalePrice(e.target.value); setWholesaleError(''); }} className="w-full bg-background border border-outline-variant rounded-lg pl-8 pr-4 py-2.5 text-[15px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-background mb-[6px]">Wholesale Minimum Qty</label>
                <div className="relative">
                  <input type="number" step="0.25" min="0.25" placeholder="e.g. 20" value={wholesaleMinQty} onChange={(e) => { setWholesaleMinQty(e.target.value); setWholesaleError(''); }} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2.5 text-[15px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-outline font-medium">kg</span>
                </div>
              </div>
            </div>
            {wholesaleError && <p className="text-error text-[12px] mt-1.5">{wholesaleError}</p>}
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
