import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getOrderAction } from '@/app/actions/orders';

const steps = [
  { label: 'Placed',    icon: 'check',       status: 'PENDING',   index: 0 },
  { label: 'Confirmed', icon: 'inventory_2', status: 'CONFIRMED', index: 1 },
  { label: 'Ready',     icon: 'agriculture', status: 'READY',     index: 2 },
  { label: 'Delivered', icon: 'home',        status: 'DELIVERED', index: 3 },
];



function OrderPageHeader({ order }: { order: any }) {
  return (
    <div className="mb-[32px] flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="font-['Manrope'] text-[48px] font-bold tracking-[-0.02em] leading-[1.1] text-primary mb-2">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <div className="font-body-lg text-on-surface-variant">
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
        <span className="font-label-md">Status: {order.orderStatus}</span>
      </div>
    </div>
  );
}

function ProgressStepper({ status }: { status: string }) {
  let currentStep = steps.findIndex(s => s.status === status);
  if (currentStep === -1) currentStep = 0; // Default or Cancelled

  const progressWidth = `${(currentStep / (steps.length - 1)) * 100}%`;

  let title = 'Your harvest is packed and ready.';
  let body = 'The farmer is preparing the delivery. Expect movement soon.';

  if (status === 'PENDING') {
    title = 'Order received by the farmer.';
    body = 'Waiting for the farmer to confirm your order.';
  } else if (status === 'CONFIRMED') {
    title = 'Order confirmed.';
    body = 'The farmer is currently harvesting and packing your order.';
  } else if (status === 'DELIVERED') {
    title = 'Order delivered.';
    body = 'Enjoy your fresh produce!';
  } else if (status === 'CANCELLED') {
    title = 'Order cancelled.';
    body = 'This order has been cancelled.';
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-level-1">
      <h2 className="font-h2 text-h2 text-primary mb-8">Tracking Journey</h2>
      
      <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-variant z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500" 
          style={{ width: status === 'CANCELLED' ? '0%' : progressWidth }}
        />
        
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const isFuture = idx > currentStep;

          let nodeClasses = "";
          let iconFilled = false;

          if (status === 'CANCELLED') {
             nodeClasses = "w-12 h-12 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center border-4 border-surface-container-lowest";
          } else if (isCompleted) {
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
                  {status === 'CANCELLED' && idx === 0 ? 'cancel' : step.icon}
                </span>
              </div>
              <div className={`font-label-md text-label-md text-center ${(isCompleted || isActive) && status !== 'CANCELLED' ? 'text-primary font-semibold' : 'text-on-surface-variant font-normal'}`}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-surface rounded-lg flex items-start gap-4 border border-surface-variant">
        <span className="material-symbols-outlined text-primary mt-1">info</span>
        <div>
          <div className="font-body-md font-medium text-on-surface">{title}</div>
          <div className="font-body-md text-on-surface-variant mt-1">{body}</div>
        </div>
      </div>
    </div>
  );
}

function HarvestSummaryCard({ items, total }: { items: any[], total: number }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-level-1">
      <h2 className="font-h2 text-h2 text-primary mb-6">Harvest Summary</h2>
      
      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b border-surface-variant pb-6 last:border-0 last:pb-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
              <Image src={item.product.photos[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'} alt={item.product.name} fill className="object-cover" sizes="96px" />
            </div>
            <div className="flex-grow">
              <div className="font-h3 text-h3 text-primary">{item.product.name}</div>
              <div className="font-body-md text-on-surface-variant">{item.product.farm.farmName}</div>
              <div className="mt-2 inline-block px-2 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded uppercase tracking-wider">
                Qty: {item.quantityKg} kg
              </div>
            </div>
            <div className="text-right">
              <div className="font-h3 text-h3 text-on-surface">₱{item.subtotal.toFixed(2)}</div>
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

function MapCard({ address }: { address: any }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-level-1 flex flex-col">
      <div className="relative w-full h-64 bg-surface-container opacity-90">
        <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80" alt="Map" fill className="object-cover" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <span className="material-symbols-outlined text-4xl text-primary drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          <div className="mt-1 px-3 py-1 rounded-full shadow-sm bg-surface-container-lowest/90 backdrop-blur-sm font-label-sm text-primary uppercase tracking-widest max-w-[200px] truncate text-center">
            {address.barangay}, {address.city}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-h3 text-h3 text-primary mb-2">Delivery Details</h3>
        <div className="font-body-md text-on-surface-variant mb-4">{address.street}, {address.barangay}, {address.city}, {address.province}</div>
        <div className="flex items-center gap-3 text-secondary">
          <span className="material-symbols-outlined">schedule</span>
          <span className="font-label-md">Est. Arrival: Today</span>
        </div>
      </div>
    </div>
  );
}

function FarmerContactCard({ items }: { items: any[] }) {
  // If multiple farms, just pick the first one for now
  const farm = items[0]?.product.farm;
  if (!farm) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-surface-variant">
      <div className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Fulfillment Partner</div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container border-2 border-surface-container-lowest shadow-sm relative shrink-0">
          <Image src={farm.user.avatarUrl || 'https://i.pravatar.cc/150?img=12'} alt={farm.farmName} fill className="object-cover" sizes="64px" />
        </div>
        <div>
          <div className="font-h3 text-h3 text-primary">{farm.user.name}</div>
          <div className="font-body-md text-on-surface-variant">{farm.farmName}</div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button 
          className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          Message Farmer
        </button>
        <button 
          className="w-full py-3 px-4 rounded-xl bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container font-label-md flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">call</span>
          Call Directly
        </button>
      </div>
    </div>
  );
}

export default async function OrderTrackingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const order = await getOrderAction(params.id);

  if (!order) {
    notFound();
  }

  return (
    <>
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[32px]">
        <OrderPageHeader order={order} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <ProgressStepper status={order.orderStatus} />
            <HarvestSummaryCard items={order.items} total={order.totalAmount} />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-8">
            <MapCard address={order.address} />
            <FarmerContactCard items={order.items} />
          </div>
        </div>
      </main>
    </>
  );
}