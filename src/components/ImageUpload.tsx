'use client';
import { useRef, useState, useCallback } from 'react';
import { ImagePlus, Loader2, X, UploadCloud } from 'lucide-react';
import Button from './Button';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Gambar',
  placeholder = 'Klik atau seret gambar ke sini',
  accept = 'image/*',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, dll)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError('Gagal membaca file');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-foreground mb-3">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative rounded-[1.5rem] overflow-hidden group shadow-soft">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="text-xs font-bold text-white tracking-widest uppercase">Memproses...</p>
            </div>
          )}
          {!uploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Ganti
              </Button>
              <Button
                variant="danger"
                size="icon"
                onClick={() => onChange(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-[1.5rem] p-8 text-center cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-primary bg-primary/5 scale-[0.98]'
              : 'border-border bg-card hover:border-primary/50 hover:bg-card/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Memproses...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">{placeholder}</p>
              <p className="text-xs text-muted-foreground">PNG, JPG maks. 5MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      {error && (
        <p className="text-xs font-medium text-destructive mt-3 flex items-center gap-1.5">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
