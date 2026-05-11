'use client';

import { useState } from 'react';
import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';

export default function AddProductPage() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [deliveryAvail, setDeliveryAvail] = useState(false);
  const [category, setCategory] = useState('vegetables');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - photos.length);
      setPhotos([...photos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <>
      <FarmerHeader variant="back" />
      <main className="max-w-[800px] mx-auto px-[16px] md:px-[48px] py-[32px] pb-32 w-full">
        <div className="mb-[32px]">
          <h2 className="text-[24px] font-semibold text-on-background">List a Product for Sale</h2>
          <p className="text-[16px] text-on-surface-variant">Provide details about your harvest to attract premium buyers.</p>
        </div>

        <form className="space-y-[32px]">
          
          {/* SECTION 1 - Photo Upload */}
          <div>
            <label className="text-[14px] font-medium text-on-background mb-[8px] block">Add Crop Photos (Max 5)</label>
            
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
              <label className="block text-[14px] font-medium text-on-background mb-[8px]">Product Name</label>
              <input type="text" placeholder="e.g., Heirloom Tomatoes" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-on-background mb-[8px]">Category</label>
              <div className="relative">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors appearance-none pr-10">
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="herbs">Herbs</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-on-background mb-[8px]">Description</label>
              <textarea rows={3} placeholder="Describe the quality, farming method, and best uses..." className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline resize-none"></textarea>
            </div>
          </div>

          {/* SECTION 3 - Pricing & Inventory */}
          <div className="bg-surface-container-lowest p-[16px] rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)]">
            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <label className="block text-[14px] font-medium text-on-background mb-[8px]">Price per kg</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-outline">₱</span>
                  <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg pl-8 pr-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-on-background mb-[8px]">Available stock (kg)</label>
                <input type="number" placeholder="100" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline" />
              </div>
              <div className="col-span-2">
                <label className="block text-[14px] font-medium text-on-background mb-[8px]">Harvest date</label>
                <input type="date" className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 text-[16px] text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors text-outline" />
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
      </main>

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
          onClick={() => console.log({ productName, price, stock, category, deliveryAvail })}
          className="w-full md:w-auto bg-primary-container text-on-primary hover:bg-primary-container/90 transition-colors py-3 px-6 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">check_circle</span>
          Publish Listing
        </button>
      </div>
      
    </>
  );
}
