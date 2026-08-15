'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deactivateProductAction, updateProductStockAction } from '@/app/actions/products';
import toast from 'react-hot-toast';

export default function ProductsClient({ products }: { products: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleDeactivate = (productId: string) => {
    if (!confirm('Are you sure you want to deactivate this product? It will be hidden from the marketplace.')) return;

    startTransition(async () => {
      const result = await deactivateProductAction(productId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to deactivate product.');
      }
    });
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    startTransition(async () => {
      const result = await updateProductStockAction(productId, newStock);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to update stock.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[20px] font-semibold text-on-background">Your Listings ({products.length})</h2>
        <Link 
          href="/farmer/products/new" 
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          List Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant">
          <span className="material-symbols-outlined text-[64px] text-primary/40 mb-4">storefront</span>
          <h2 className="text-[20px] font-semibold text-on-surface mb-2">No Products Listed</h2>
          <p className="text-on-surface-variant mb-6">You haven't listed any crops for sale yet.</p>
          <Link href="/farmer/products/new" className="inline-block bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors">
            Create First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-48 w-full bg-surface-variant">
                {product.photos && product.photos.length > 0 ? (
                  <Image src={product.photos[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px]">image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    product.status === 'ACTIVE' ? 'bg-primary text-white' :
                    product.status === 'PENDING_REVIEW' ? 'bg-accent-50 text-accent-700 border border-accent-200' :
                    'bg-error-container text-on-error-container'
                  }`}>
                    {product.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-on-surface text-[18px] line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-primary">{product.crop?.cropName || 'Standalone Product'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-on-surface block">₱{product.pricePerKg.toFixed(2)}</span>
                    <span className="text-xs text-on-surface-variant">per kg</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-surface-variant">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant mb-1">Available Stock</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0"
                        defaultValue={product.stockKg}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val !== product.stockKg && val >= 0) {
                            handleUpdateStock(product.id, val);
                          }
                        }}
                        disabled={isPending}
                        className="w-20 px-2 py-1 border border-outline-variant rounded-md text-sm text-center focus:outline-none focus:border-primary disabled:opacity-50"
                      />
                      <span className="text-sm font-medium">kg</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link 
                    href={`/farmer/products/${product.id}/edit`}
                    className="flex-1 bg-primary-container text-on-primary-container text-center py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit
                  </Link>
                  {product.status !== 'REMOVED' && (
                    <button 
                      onClick={() => handleDeactivate(product.id)}
                      disabled={isPending}
                      className="flex-1 bg-error-container text-on-error-container text-center py-2 rounded-lg font-medium hover:bg-error/20 transition-colors text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
