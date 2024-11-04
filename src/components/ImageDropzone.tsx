import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function ImageDropzone({ value, onChange, className = '' }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateImageUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type');
      return contentType?.startsWith('image/');
    } catch {
      return false;
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const items = Array.from(e.dataTransfer.items);
    const textItems = items.filter(item => item.kind === 'string' && item.type === 'text/plain');

    if (textItems.length > 0) {
      textItems[0].getAsString(async (url) => {
        if (await validateImageUrl(url)) {
          onChange(url);
        } else {
          setError('Please provide a valid image URL');
        }
      });
    } else {
      setError('Please drag an image URL');
    }
  }, [onChange]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    setError(null);

    if (await validateImageUrl(pastedText)) {
      onChange(pastedText);
    } else {
      setError('Please paste a valid image URL');
    }
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={`
            h-48 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${isDragging 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300 hover:border-orange-500'
            }
          `}
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            Drag &amp; drop an image URL or paste it here
          </p>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}