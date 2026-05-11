'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';

const mockProduct = {
  id: '1',
  name: 'Premium Heirloom Tomatoes',
  price: 240.00,
  unit: 'kg',
  badge: 'In Stock',
  description: [
    'Cultivated in the rich soils of Agoo, these heirloom tomatoes offer an unparalleled depth of flavor. Each variety is carefully selected for its unique taste profile, ranging from sweet and fruity to robust and earthy.',
    'Perfect for high-end culinary applications, fresh salads, or simply enjoyed with a touch of sea salt.'
  ],
  harvestDate: 'Today, 6:00 AM',
  category: 'Vegetables',
  images: [
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80',
    'https://images.unsplash.com/photo-1558818498-28c1e002b655?w=800&q=80',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
    'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=800&q=80',
  ],
  farmer: {
    id: 'f1',
    name: 'Ramon Delos Reyes',
    avatar: 'https://i.pravatar.cc/150?img=57',
    location: 'San Julian, Agoo',
    rating: 4.9,
    reviewCount: 128,
  },
};

const relatedProducts = [
  {
    id: '3',
    name: 'Sweet Nantes Carrots',
    description: 'Crisp, sweet, and perfect for roasting or raw snacking.',
    price: 120.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80',
  },
  {
    id: '5',
    name: 'Japanese Eggplant',
    description: 'Tender, slender eggplants with thin skin, ideal for stir-fries.',
    price: 90.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&q=80',
  },
  {
    id: '6',
    name: 'Crisp Bell Peppers',
    description: 'Locally grown, vibrant green peppers with a satisfying crunch.',
    price: 150.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80',
  },
  {
    id: '7',
    name: 'Fresh Kangkong',
    description: 'Water spinach harvested fresh this morning from local fields.',
    price: 30.00,
    unit: 'bundle',
    image: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=400&q=80',
  },
];

function Breadcrumb() {
  return (
    <nav className="mb-[16px] flex items-center gap-2 text-[14px] font-medium text-on-surface-variant" style={{ letterSpacing: '0.01em' }}>
      <Link href="/products" className="hover:text-primary transition-colors">
        Marketplace
      </Link>
      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      <Link href="/products?category=vegetables" className="hover:text-primary transition-colors">
        Vegetables
      </Link>
      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      <span className="text-on-surface">{mockProduct.name}</span>
    </nav>
  );
}

function ImageGallery() {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="lg:col-span-7 flex flex-col gap-[8px]">
      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container shadow-level-1 relative">
        <Image
          key={activeImage}
          src={mockProduct.images[activeImage]}
          alt={mockProduct.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-[8px]">
        {mockProduct.images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`aspect-square rounded-lg overflow-hidden bg-surface-container cursor-pointer relative transition-colors border-2 ${
              activeImage === idx ? 'border-primary' : 'border-transparent hover:border-outline-variant'
            }`}
          >
            <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 25vw, 15vw" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = () => {
    addItem({
      productId: mockProduct.id,
      name: mockProduct.name,
      pricePerKg: mockProduct.price,
      quantityKg: quantity,
      photo: mockProduct.images[0],
      farmerName: mockProduct.farmer.name,
    });
  };

  const handleRelatedAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      pricePerKg: product.price,
      quantityKg: 1,
      photo: product.image,
      farmerName: mockProduct.farmer.name,
    });
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[48px]">
        <Breadcrumb />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <ImageGallery />

          <div className="lg:col-span-5 flex flex-col h-full">
            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 mb-[16px]">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm uppercase tracking-[0.03em]">
                {mockProduct.badge}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm uppercase tracking-[0.03em]">
                <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Freshness Guaranteed
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-on-background mb-[8px]">
              {mockProduct.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-end gap-2 mb-[32px]">
              <span className="font-h1 text-primary text-[32px] font-bold leading-[1.2] tracking-[-0.01em]">
                ₱{mockProduct.price.toFixed(2)}
              </span>
              <span className="font-body-md text-on-surface-variant mb-1">
                / {mockProduct.unit}
              </span>
            </div>

            {/* Description */}
            <div className="mb-[32px] border-b border-surface-variant pb-[32px] space-y-4">
              {mockProduct.description.map((p, idx) => (
                <p key={idx} className="font-body-lg text-on-surface-variant text-[18px]">
                  {p}
                </p>
              ))}
              <div className="flex items-center gap-2 mt-4 text-on-surface">
                <span className="material-symbols-outlined text-outline">calendar_month</span>
                <span className="font-label-md">
                  Harvested: <strong className="font-semibold">{mockProduct.harvestDate}</strong>
                </span>
              </div>
            </div>

            {/* Purchase Actions */}
            <div className="flex flex-col gap-[16px] mb-[32px]">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-12 w-32 bg-surface-container-lowest">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <input
                    type="text"
                    aria-label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="flex-grow text-center h-full border-none focus:ring-0 font-label-md bg-transparent text-on-surface p-0 w-12 outline-none"
                  />
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
                <span className="font-body-md text-on-surface-variant">kg</span>
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full bg-primary text-on-primary font-label-md py-4 rounded-xl shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98] flex justify-center items-center gap-2"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Add to Cart
              </button>
            </div>

            {/* Farmer Card */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 border border-surface-container-highest mt-auto">
              <div className="font-label-sm text-outline uppercase tracking-[0.03em] mb-4">Cultivated By</div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-variant flex-shrink-0 relative">
                  <Image src={mockProduct.farmer.avatar} alt={mockProduct.farmer.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-grow">
                  <div className="font-h3 text-on-surface mb-1">{mockProduct.farmer.name}</div>
                  <div className="flex items-center gap-1 font-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {mockProduct.farmer.location}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-container-highest">
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-md">{mockProduct.farmer.rating}</span>
                  <span className="font-body-md text-on-surface-variant ml-1">({mockProduct.farmer.reviewCount} reviews)</span>
                </div>
                <Link href={`/farmer/${mockProduct.farmer.id}`} className="font-label-md text-primary hover:text-primary-container font-semibold transition-colors">
                  View Farm
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* MoreFromFarmer */}
        <section className="mt-[48px] pt-[48px] border-t border-surface-variant">
          <div className="flex justify-between items-end mb-[32px]">
            <h2 className="font-h2 text-on-background tracking-[-0.01em]">More from Ramon's Farm</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex overflow-x-auto gap-6 pb-4 snap-x hide-scrollbar">
            {relatedProducts.map(product => (
              <Link href={`/products/${product.id}`} key={product.id} className="min-w-[280px] w-[280px] snap-start bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden group cursor-pointer border border-transparent hover:border-surface-variant transition-colors block">
                <div className="h-48 w-full bg-surface-container overflow-hidden relative">
                  <Image src={product.image} alt={product.name} fill sizes="280px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <div className="font-h3 text-on-surface line-clamp-1">{product.name}</div>
                  <div className="font-body-md text-on-surface-variant line-clamp-2 h-[48px]">{product.description}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="font-label-md font-semibold text-primary">
                      ₱{product.price.toFixed(2)} / {product.unit}
                    </div>
                    <button 
                      onClick={(e) => handleRelatedAddToCart(e, product)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}