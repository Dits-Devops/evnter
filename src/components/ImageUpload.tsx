'use client';
import { useRef, useState, useCallback } from 'react';

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
  placeholder = 'Seret gambar ke sini atau klik untuk memilih',
  accept = 'image/*',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert file to base64 data URL (no server upload needed for preview/storage as URL)
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
      setError('File harus berupa gambar');
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
    <div>
      {label && (
        <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      )}

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Memproses...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">🖼️</span>
              <p className="text-sm text-gray-500">{placeholder}</p>
              <span className="text-xs text-blue-600 font-semibold underline">
                Pilih File
              </span>
              <p className="text-xs text-gray-400">PNG, JPG, GIF maks. 5MB</p>
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
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
