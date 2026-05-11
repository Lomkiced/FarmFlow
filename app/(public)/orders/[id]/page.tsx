'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';

const mockOrder = {
  id: 'FF-8924',
  placedOn: 'October 24, 2024',
  status: 'Ready for Delivery',
  currentStep: 2,
  statusMessage: {
    title: 'Your harvest is packed and ready.',
    body: 'Farmer Santos is preparing the delivery vehicle. Expect movement within the next few hours.',
  },
  items: [
    {
      id: 'i1',
      name: 'Organic Heirloom Tomatoes',
      farm: 'Agoo Valley Farms',
      qty: '5 kg',
      price: 1250.00,
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
    },
    {
      id: 'i2',
      name: 'Fresh Green Kale Bundle',
      farm: 'Agoo Valley Farms',
      qty: '3 bundles',
      price: 450.00,
      image: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=400&q=80',
    },
  ],
  delivery: {
    address: 'Central Market Hub, Block 4',
    note: 'Ensure someone is available to receive the fresh produce.',
    eta: 'Today, 2:00 PM',
    mapImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80',
    location: 'Agoo, La Union',
  },
  farmer: {
    name: 'Miguel Santos',
    farm: 'Agoo Valley Farms',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
};

const steps = [
  { label: 'Placed',    icon: 'check',       index: 0 },
  { label: 'Confirmed', icon: 'inventory_2', index: 1 },
  { label: 'Ready',     icon: 'agriculture', index: 2 },
  { label: 'Delivered', icon: 'home',        index: 3 },
];

function TrackingHeader() {
  const router = useRouter();
  
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-stone-200 shadow-sm px-8 py-4">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-md font-medium">Back to Orders</span>
        </button>

        <div className="font-display font-black text-2xl text-emerald-900 tracking-tighter">
          FarmFlow Track
        </div>

        <div className="w-[120px]" /> {/* Spacer for centering */}
      </div>
    </header>
  );
}

function OrderPageHeader() {
  return (
    <div className="mb-[32px] flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="font-['Manrope'] text-[48px] font-bold tracking-[-0.02em] leading-[1.1] text-primary mb-2">
          Order #{mockOrder.id}
        </h1>
        <div className="font-body-lg text-on-surface-variant">
          Placed on {mockOrder.placedOn}
        </div>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
        <span className="font-label-md">Status: {mockOrder.status}</span>
      </div>
    </div>
  );
}

function ProgressStepper() {
  const currentStep = mockOrder.currentStep;
  const progressWidth = `${(currentStep / (steps.length - 1)) * 100}%`;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-level-1">
      <h2 className="font-h2 text-h2 text-primary mb-8">Tracking Journey</h2>
      
      <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-variant z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500" 
          style={{ width: progressWidth }}
        />
        
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const isFuture = idx > currentStep;

          let nodeClasses = "";
          let iconFilled = false;

          if (isCompleted) {
            nodeClasses = "w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm border-4 border-surface-container-lowest";
            iconFilled = true;
          } else if (isActive) {
            nodeClasses = "w-12 h-12 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-md border-4 border-primary ring-4 ring-primary/20";
            iconFilled = true;
          } else if (isFuture) {
            nodeClasses = "w-12 h-12 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center border-4 border-surface-container-lowest";
            iconFilled = false;
          }

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
              <div className={nodeClasses}>
                <span className="material-symbols-outlined" style={iconFilled ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {step.icon}
                </span>
              </div>
              <div className={`font-label-md text-label-md text-center ${(isCompleted || isActive) ? 'text-primary font-semibold' : 'text-on-surface-variant font-normal'}`}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-surface rounded-lg flex items-start gap-4 border border-surface-variant">
        <span className="material-symbols-outlined text-primary mt-1">info</span>
        <div>
          <div className="font-body-md font-medium text-on-surface">{mockOrder.statusMessage.title}</div>
          <div className="font-body-md text-on-surface-variant mt-1">{mockOrder.statusMessage.body}</div>
        </div>
      </div>
    </div>
  );
}

function HarvestSummaryCard() {
  const total = mockOrder.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-level-1">
      <h2 className="font-h2 text-h2 text-primary mb-6">Harvest Summary</h2>
      
      <div className="flex flex-col gap-6">
        {mockOrder.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b border-surface-variant pb-6 last:border-0 last:pb-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
              <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover" />
            </div>
            <div className="flex-grow">
              <div className="font-h3 text-h3 text-primary">{item.name}</div>
              <div className="font-body-md text-on-surface-variant">{item.farm}</div>
              <div className="mt-2 inline-block px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded uppercase tracking-wider">
                Qty: {item.qty}
              </div>
            </div>
            <div className="text-right">
              <div className="font-h3 text-h3 text-on-surface">₱{item.price.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-surface-variant flex justify-between items-center">
        <div className="font-body-lg text-on-surface-variant">Total Amount Paid</div>
        <div className="font-h2 text-h2 text-primary">₱{total.toFixed(2)}</div>
      </div>
    </div>
  );
}

function MapCard() {
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-level-1 flex flex-col">
      <div className="relative w-full h-64 bg-surface-container opacity-90">
        <Image src={mockOrder.delivery.mapImage} alt="Map" fill className="object-cover" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <span className="material-symbols-outlined text-4xl text-primary drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          <div className="mt-1 px-3 py-1 rounded-full shadow-sm bg-surface-container-lowest/90 backdrop-blur-sm font-label-sm text-primary uppercase tracking-widest">
            {mockOrder.delivery.location}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-h3 text-h3 text-primary mb-2">Delivery Details</h3>
        <div className="font-body-md text-on-surface-variant mb-4">{mockOrder.delivery.address}. {mockOrder.delivery.note}</div>
        <div className="flex items-center gap-3 text-secondary">
          <span className="material-symbols-outlined">schedule</span>
          <span className="font-label-md">Est. Arrival: {mockOrder.delivery.eta}</span>
        </div>
      </div>
    </div>
  );
}

function FarmerContactCard() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-surface-variant">
      <div className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Fulfillment Partner</div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container border-2 border-surface-container-lowest shadow-sm relative shrink-0">
          <Image src={mockOrder.farmer.avatar} alt={mockOrder.farmer.name} width={64} height={64} className="object-cover" />
        </div>
        <div>
          <div className="font-h3 text-h3 text-primary">{mockOrder.farmer.name}</div>
          <div className="font-body-md text-on-surface-variant">{mockOrder.farmer.farm}</div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => alert('Messaging coming soon!')}
          className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          Message Farmer
        </button>
        <button 
          onClick={() => alert('Calling coming soon!')}
          className="w-full py-3 px-4 rounded-xl bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container font-label-md flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">call</span>
          Call Directly
        </button>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <>
      <TrackingHeader />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[32px]">
        <OrderPageHeader />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <ProgressStepper />
            <HarvestSummaryCard />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-8">
            <MapCard />
            <FarmerContactCard />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}