import Image from 'next/image';
import { sanitizeProfileImageUrl } from '@/lib/constants/farm-media';

/**
 * Classic Facebook-style blank user silhouette SVG on neutral gray background.
 * Shown whenever a user/farmer has no uploaded profile picture.
 */
export function BlankAvatarSilhouette({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full bg-gray-200 flex items-end justify-center overflow-hidden ${className}`}>
      <svg
        className="w-[82%] h-[82%] text-gray-400 translate-y-1"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-10 1.933-10 5.8V22h20v-2.2c0-3.867-6.134-5.8-10-5.8z" />
      </svg>
    </div>
  );
}

/**
 * Renders a circular profile avatar if sanitized URL exists,
 * otherwise falls back to the Facebook-style blank avatar silhouette.
 */
export function ProfileAvatar({
  src,
  alt,
  className = 'w-10 h-10',
  sizes = '80px',
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const cleanSrc = sanitizeProfileImageUrl(src);

  return (
    <div className={`rounded-full overflow-hidden bg-gray-200 relative shrink-0 ${className}`}>
      {cleanSrc ? (
        <Image src={cleanSrc} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <BlankAvatarSilhouette />
      )}
    </div>
  );
}

/**
 * Clean neutral gray placeholder shown when a farm has no uploaded cover photo.
 */
export function CoverPhotoPlaceholder({
  label = 'No cover photo',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full h-full bg-gray-100 border-b border-gray-200 flex flex-col items-center justify-center text-gray-400 select-none ${className}`}
    >
      <span className="text-xs font-medium tracking-wide">{label}</span>
    </div>
  );
}

