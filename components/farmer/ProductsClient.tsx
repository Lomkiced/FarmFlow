'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deactivateProductAction, updateProductStockAction } from '@/app/actions/products';
import PaginationBar from '@/components/ui/PaginationBar';
import toast from 'react-hot-toast';

export default function ProductsClient({ products }: { products: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_REVIEW' | 'REMOVED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filteredProducts = products.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchCrop = p.crop?.cropName?.toLowerCase().includes(q);
      if (!matchName && !matchCrop) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900">Your Listings ({filteredProducts.length})</h2>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search listings..."
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-green-800 text-gray-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="REMOVED">Deactivated</option>
          </select>
          <Link 
            href="/farmer/products/new" 
            className="bg-green-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-900 transition-colors"
          >
            List Product
          </Link>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-1">No Products Found</h3>
          <p className="text-xs text-gray-500 mb-4">
            {products.length === 0 ? "You haven't listed any crops for sale yet." : "No listings match your current search or status filter."}
          </p>
          <Link href="/farmer/products/new" className="inline-block bg-green-800 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-900 transition-colors">
            Create First Listing
          </Link>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:border-green-800 transition-colors">
              <div className="relative h-44 w-full bg-gray-100">
                {product.photos && product.photos.length > 0 ? (
                  <Image src={product.photos[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                    No Photo
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    product.status === 'ACTIVE' ? 'bg-green-50 text-green-800 border border-green-200' :
                    product.status === 'PENDING_REVIEW' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {product.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.crop?.cropName || 'Standalone Produce'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-800 text-sm tabular-nums block">₱{product.pricePerKg.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400">per kg</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Available Stock</span>
                  <div className="flex items-center gap-1.5">
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
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center tabular-nums focus:outline-none focus:border-green-800 disabled:opacity-50"
                    />
                    <span className="text-xs text-gray-600 font-medium">kg</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link 
                    href={`/farmer/products/${product.id}/edit`}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-center py-1.5 rounded-lg font-semibold text-xs transition-colors"
                  >
                    Edit
                  </Link>
                  {product.status !== 'REMOVED' && (
                    <button 
                      onClick={() => handleDeactivate(product.id)}
                      disabled={isPending}
                      className="flex-1 border border-red-300 hover:bg-red-50 text-red-700 text-center py-1.5 rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <PaginationBar
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[3, 6, 9, 18]}
          itemLabel="listings"
        />
        </>
      )}
    </div>
  );
}
