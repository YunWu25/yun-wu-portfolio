import React, { useState } from 'react';
import { Language } from '../App';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Download, Lock, CheckCircle } from 'lucide-react';

interface TimeProps {
  language: Language;
}

interface ClientPhoto {
  key: string;
  url: string;
  filename: string;
  size: number;
}

interface ClientPhotosResponse {
  photos: ClientPhoto[];
  folderName: string;
}

const Time: React.FC<TimeProps> = ({ language }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [photos, setPhotos] = useState<ClientPhoto[]>([]);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  const text = {
    en: {
      intro: 'Private client gallery. Enter your access code to view and download your photos.',
      enterCode: 'Enter Access Code',
      placeholder: 'Access code',
      submit: 'Access Gallery',
      invalidCode: 'Invalid access code. Please try again.',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      downloadSelected: 'Download Selected',
      downloadAll: 'Download All',
      noPhotos: 'No photos available in this gallery.',
      downloading: 'Preparing download...',
      selected: 'selected',
    },
    zh: {
      intro: '私人客户画廊。输入您的访问码以查看和下载照片。',
      enterCode: '输入访问码',
      placeholder: '访问码',
      submit: '访问画廊',
      invalidCode: '访问码无效，请重试。',
      selectAll: '全选',
      deselectAll: '取消全选',
      downloadSelected: '下载所选',
      downloadAll: '下载全部',
      noPhotos: '此画廊中没有照片。',
      downloading: '正在准备下载...',
      selected: '已选择',
    },
  };

  const t = text[language];

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/client-photos?code=${encodeURIComponent(accessCode.trim())}`);

      if (!response.ok) {
        if (response.status === 401) {
          setError(t.invalidCode);
        } else {
          throw new Error('Failed to fetch photos');
        }
        return;
      }

      const data: ClientPhotosResponse = await response.json();
      setPhotos(data.photos);
      setFolderName(data.folderName);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error fetching client photos:', err);
      setError(language === 'en' ? 'Something went wrong. Please try again.' : '出了点问题，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const togglePhotoSelection = (key: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedPhotos(new Set(photos.map((p) => p.key)));
  };

  const deselectAll = () => {
    setSelectedPhotos(new Set());
  };

  const downloadPhoto = (photo: ClientPhoto) => {
    // Use the download API endpoint to avoid CORS issues
    const downloadUrl = `/api/download-photo?key=${encodeURIComponent(photo.key)}&filename=${encodeURIComponent(photo.filename)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = photo.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSelected = async () => {
    if (selectedPhotos.size === 0) return;

    setDownloading(true);
    const photosToDownload = photos.filter((p) => selectedPhotos.has(p.key));

    for (const photo of photosToDownload) {
      downloadPhoto(photo);
      // Small delay between downloads to avoid browser blocking
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setDownloading(false);
  };

  const downloadAll = async () => {
    setDownloading(true);

    for (const photo of photos) {
      downloadPhoto(photo);
      // Small delay between downloads to avoid browser blocking
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setDownloading(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Access code entry screen
  if (!isAuthenticated) {
    return (
      <div className="w-full">
        <div className="mb-12 text-center">
          <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>{t.intro}</p>
        </div>

        <div className="flex justify-center items-center min-h-[40vh]">
          <form onSubmit={(e) => void handleSubmitCode(e)} className="w-full max-w-md">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Lock size={32} className={COLORS.gray400} />
                </div>
              </div>

              <h2 className={`text-center ${TYPOGRAPHY.cardTitle} ${COLORS.gray600} mb-6`}>
                {t.enterCode}
              </h2>

              <input
                type="text"
                value={accessCode}
                onChange={(e) => { setAccessCode(e.target.value); }}
                placeholder={t.placeholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-coral transition-colors text-center text-lg tracking-widest"
                autoComplete="off"
              />

              {error && (
                <p className="text-red-500 text-sm text-center mt-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !accessCode.trim()}
                className="w-full mt-6 px-6 py-3 bg-coral text-white rounded-lg hover:bg-coral/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? '...' : t.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Photo gallery (authenticated)
  return (
    <div className="w-full">
      {/* Header with folder name and actions */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className={`${TYPOGRAPHY.cardTitle} ${COLORS.gray600}`}>{folderName}</h2>
            <p className={`${TYPOGRAPHY.body} ${COLORS.gray400} mt-1`}>
              {photos.length} {language === 'en' ? 'photos' : '张照片'}
              {selectedPhotos.size > 0 && ` (${selectedPhotos.size} ${t.selected})`}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={selectedPhotos.size === photos.length ? deselectAll : selectAll}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              {selectedPhotos.size === photos.length ? t.deselectAll : t.selectAll}
            </button>

            {selectedPhotos.size > 0 && (
              <button
                onClick={() => void downloadSelected()}
                disabled={downloading}
                className="px-4 py-2 text-sm bg-coral text-white rounded-lg hover:bg-coral/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Download size={16} />
                {downloading ? t.downloading : t.downloadSelected}
              </button>
            )}

            <button
              onClick={() => void downloadAll()}
              disabled={downloading}
              className="px-4 py-2 text-sm border border-coral text-coral rounded-lg hover:bg-coral hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Download size={16} />
              {t.downloadAll}
            </button>
          </div>
        </div>
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="flex justify-center items-center h-[40vh]">
          <p className={`${TYPOGRAPHY.body} ${COLORS.gray400}`}>{t.noPhotos}</p>
        </div>
      ) : (
        <>
        {/* Instruction text */}
        <p className={`text-sm ${COLORS.gray400} mb-4`}>
          {language === 'en'
            ? '💡 Click photos to select, or tap the download button on each photo'
            : '💡 点击照片选择，或点击每张照片上的下载按钮'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const isSelected = selectedPhotos.has(photo.key);
            return (
              <div
                key={photo.key}
                className={`group relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 aspect-square border-2 transition-all ${
                  isSelected ? 'border-coral' : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => { togglePhotoSelection(photo.key); }}
              >
                {/* Thumbnail */}
                <img
                  src={photo.url}
                  alt={photo.filename}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Selection indicator - always visible */}
                <div
                  className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
                    isSelected
                      ? 'bg-coral border-coral'
                      : 'bg-white/80 border-gray-300'
                  }`}
                >
                  {isSelected && <CheckCircle size={16} className="text-white" />}
                </div>

                {/* Download button - always visible */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadPhoto(photo);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-coral hover:text-white transition-all"
                  title={language === 'en' ? 'Download' : '下载'}
                >
                  <Download size={16} className="text-gray-600 group-hover:text-gray-800" />
                </button>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm truncate">{photo.filename}</p>
                  <p className="text-white/70 text-xs">{formatFileSize(photo.size)}</p>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
};

export default Time;
