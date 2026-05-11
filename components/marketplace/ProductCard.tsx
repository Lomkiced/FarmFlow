import Image from 'next/image';

interface ProductCardProps {
  image: string;
  alt: string;
  badge: 'In Stock' | 'Low Stock' | 'Out of Stock';
  farmerAvatar: string;
  farmerName: string;
  productName: string;
  price: string;
  unit?: string;
}

export default function ProductCard({
  image,
  alt,
  badge,
  farmerAvatar,
  farmerName,
  productName,
  price,
  unit = '/kg',
}: ProductCardProps) {
  const badgeClasses = {
    'In Stock': 'bg-secondary-container text-on-secondary-container',
    'Low Stock': 'bg-surface-variant text-on-surface-variant',
    'Out of Stock': 'bg-error text-white',
  };

  return (
    <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(27,67,50,0.04)] flex flex-col group relative">
      {/* Badge */}
      <span
        className={`absolute top-3 right-3 z-10 font-label-sm px-2 py-1 rounded-md shadow-sm ${badgeClasses[badge]}`}
      >
        {badge}
      </span>

      {/* Image */}
      <div className="h-48 overflow-hidden relative">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-[8px] flex-grow">
        {/* Farmer Row */}
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Image
            src={farmerAvatar}
            alt={farmerName}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="font-label-sm">{farmerName}</span>
        </div>

        {/* Product Name */}
        <h3 className="font-h3 text-on-surface line-clamp-1">{productName}</h3>

        {/* Bottom Row */}
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="font-h3 text-primary">{price}</span>
            <span className="font-body-md text-on-surface-variant">{unit}</span>
          </div>

          <button className="w-10 h-10 rounded-full bg-surface-variant text-primary flex items-center justify-center hover:bg-secondary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
            <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}