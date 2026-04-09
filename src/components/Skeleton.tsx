'use client';

interface SkeletonProps {
  variant?: 'rectangular' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';
  const variantClasses = {
    rectangular: 'rounded-2xl',
    circle: 'rounded-full',
    text: 'rounded h-4 mb-2',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function EventSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height={224} className="w-full" />
      <div className="px-4 py-5 space-y-4">
        <div className="space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="90%" height={32} />
        </div>
        <div className="space-y-3 bg-gray-50 p-4 rounded-2xl">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
        <Skeleton height={48} className="w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function OrganizerEventSkeleton() {
  return (
    <div className="space-y-4 px-4 py-4">
      <Skeleton height={140} className="w-full rounded-3xl" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton height={80} className="rounded-2xl" />
        <Skeleton height={80} className="rounded-2xl" />
        <Skeleton height={80} className="rounded-2xl" />
      </div>
      <Skeleton height={44} className="w-full rounded-xl" />
      <div className="space-y-3 pt-2">
        <Skeleton height={120} className="w-full rounded-3xl" />
        <Skeleton height={120} className="w-full rounded-3xl" />
      </div>
    </div>
  );
}

export function EventListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 animate-in-fade">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl p-4 shadow-soft space-y-3">
          <Skeleton height={160} className="w-full rounded-2xl" />
          <Skeleton variant="text" width="70%" height={24} />
          <Skeleton variant="text" width="40%" />
        </div>
      ))}
    </div>
  );
}

export function TicketListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 animate-in-fade">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl p-4 shadow-soft space-y-3">
          <div className="flex justify-between items-start">
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="20%" />
          </div>
          <Skeleton height={100} className="w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

export function MyEventsListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-5 animate-in-fade px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-soft">
          <Skeleton height={160} className="w-full" />
          <div className="p-5 space-y-3">
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="40%" />
            <div className="flex gap-2 pt-4 border-t">
              <Skeleton height={36} className="flex-1 rounded-xl" />
              <Skeleton height={36} className="flex-1 rounded-xl" />
              <Skeleton height={36} width={36} className="rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3 animate-in-fade">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-soft flex gap-3">
          <Skeleton variant="circle" width={40} height={40} className="shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}



