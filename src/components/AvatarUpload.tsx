'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Loader2, X, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';

interface AvatarUploadProps {
  value?: string | null;
  onUploadSuccess: (url: string) => void;
  className?: string;
}

export default function AvatarUpload({
  value,
  onUploadSuccess,
  className = '',
}: AvatarUploadProps) {
  const { user } = useAuth();
  const alert = useAlert();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Sync preview with value if value changes externally
  useEffect(() => {
    if (value) setPreview(value);
  }, [value]);

  const uploadImage = async (file: File) => {
    if (!user) return;

    // 1. Validasi
    if (!file.type.startsWith('image/')) {
      alert.error('Error', 'File harus berupa gambar');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit for avatars
      alert.error('Error', 'Ukuran foto maksimal 2MB');
      return;
    }

    setUploading(true);
    
    // Create temporary local preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 2. Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 4. Callback
      onUploadSuccess(publicUrl);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      alert.error('Upload Gagal', error.message || 'Terjadi kesalahan saat mengupload foto');
      setPreview(value || null); // Revert preview on error
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadImage(file);
  }, [user]);

  return (
    <div 
      className={`relative group ${className}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <div className={`
        relative w-32 h-32 rounded-[2rem] overflow-hidden border-4 transition-all duration-300
        ${dragging ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-white shadow-xl'}
        ${uploading ? 'opacity-50' : 'opacity-100'}
      `}>
        {preview ? (
          <img 
            src={preview} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Overlay on hover */}
        <div 
          onClick={() => !uploading && inputRef.current?.click()}
          className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
        >
          <Camera className="w-8 h-8 text-white mb-1" />
          <span className="text-[10px] text-white font-bold uppercase tracking-wider">Ubah Foto</span>
        </div>

        {/* Loading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden Input */}
      <input 
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={uploading}
      />
      
      {/* Label/Hint */}
      {dragging && (
         <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full animate-bounce">
            Lepas untuk upload
         </div>
      )}
    </div>
  );
}
