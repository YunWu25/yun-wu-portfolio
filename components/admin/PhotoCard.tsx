import React, { useState, useCallback } from 'react';
import { AdminPhoto, PhotoMetadataUpdate } from '../../types';

interface PhotoCardProps {
  photo: AdminPhoto;
  onSave: (data: PhotoMetadataUpdate) => Promise<void>;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onSave }) => {
  const [formData, setFormData] = useState({
    title: photo.title,
    alt: photo.alt,
    artist: photo.artist,
    season: photo.season,
  });
  const [originalData] = useState(formData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const hasChanges = 
    formData.title !== originalData.title ||
    formData.alt !== originalData.alt ||
    formData.artist !== originalData.artist ||
    formData.season !== originalData.season;

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    setErrorMessage('');
    try {
      await onSave({
        key: photo.key,
        ...formData,
      });
      setSaveStatus('success');
      setTimeout(() => { setSaveStatus('idle'); }, 2000);
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save');
      setTimeout(() => { setSaveStatus('idle'); }, 3000);
    }
  }, [onSave, photo.key, formData]);

  const formatSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return bytes.toFixed(i > 0 ? 1 : 0) + ' ' + (units[i] ?? 'B');
  };

  const formatDate = (isoString: string): string => {
    if (!isoString) return 'Unknown';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isModified = (field: keyof typeof formData) => formData[field] !== originalData[field];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-[200px_1fr]">
      {/* Thumbnail */}
      <img
        src={photo.url}
        alt={photo.alt}
        loading="lazy"
        className="w-full h-48 md:h-full object-cover bg-gray-100"
      />

      {/* Details */}
      <div className="p-5 flex flex-col gap-4">
        {/* Key and metadata */}
        <div className="text-xs font-mono text-gray-400 break-all">
          {photo.key}
          <span className="text-gray-500 block mt-1">
            {formatSize(photo.size)} • Uploaded {formatDate(photo.uploaded)}
          </span>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Title"
            name="title"
            value={formData.title}
            placeholder="Photo title"
            modified={isModified('title')}
            onChange={(v) => { handleChange('title', v); }}
          />
          <Field
            label="Alt Text"
            name="alt"
            value={formData.alt}
            placeholder="Alt description"
            modified={isModified('alt')}
            onChange={(v) => { handleChange('alt', v); }}
          />
          <Field
            label="Artist"
            name="artist"
            value={formData.artist}
            placeholder="Artist name"
            modified={isModified('artist')}
            onChange={(v) => { handleChange('artist', v); }}
          />
          <Field
            label="Season"
            name="season"
            value={formData.season}
            placeholder="e.g., Fall 2024"
            modified={isModified('season')}
            onChange={(v) => { handleChange('season', v); }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto pt-2">
          <button
            onClick={() => { void handleSave(); }}
            disabled={saveStatus === 'saving' || !hasChanges}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${saveStatus === 'idle' && hasChanges
                ? 'bg-gray-900 text-white hover:bg-black'
                : saveStatus === 'saving'
                ? 'bg-gray-400 text-white cursor-wait'
                : saveStatus === 'success'
                ? 'bg-green-500 text-white'
                : saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {saveStatus === 'idle' && 'Save'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'success' && '✓ Saved'}
            {saveStatus === 'error' && '✗ Error'}
          </button>
          {errorMessage && (
            <span className="text-xs text-red-500">{errorMessage}</span>
          )}
          {hasChanges && saveStatus === 'idle' && (
            <span className="text-xs text-amber-600">Unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Field sub-component
interface FieldProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  modified: boolean;
  onChange: (value: string) => void;
}

const Field: React.FC<FieldProps> = ({ label, name, value, placeholder, modified, onChange }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </label>
    <input
      id={name}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => { onChange(e.target.value); }}
      className={`
        px-3 py-2 border rounded-lg text-sm transition-colors
        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
        ${modified ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}
      `}
    />
  </div>
);
