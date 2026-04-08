export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizes[size]} border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
}
