import React, { useEffect, useState } from 'react';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Language } from '../App';
import Lightbox from './Lightbox';
import { ShoppingCart, X, CheckCircle, ChevronLeft, ExternalLink } from 'lucide-react';

interface PhotoData {
  key: string;
  url: string;
  title: string;
  alt: string;
  artist: string;
  season: string;
}

interface SellingPhoto {
  key: string;
  url: string;
  filename: string;
  size: number;
  price?: number;
}

interface PhotographyProps {
  language: Language;
}

// Helper to generate optimized thumbnail URL using Cloudflare Image Resizing
const getThumbnailUrl = (url: string, width: number = 400): string => {
  // Extract the path after the domain
  const match = url.match(/https:\/\/media\.yunwustudio\.com\/(.+)/);
  if (!match?.[1]) return url;

  // Use Cloudflare Image Resizing: /cdn-cgi/image/options/path
  return `https://media.yunwustudio.com/cdn-cgi/image/width=${width},quality=80,format=auto/${match[1]}`;
};

// Fallback to original URL if optimized image fails to load
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, originalUrl: string) => {
  const target = e.currentTarget;
  if (target.src !== originalUrl) {
    target.src = originalUrl;
  }
};

const Photography: React.FC<PhotographyProps> = ({ language }) => {
  const [columnCount, setColumnCount] = useState(2);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Shop state
  const [showShop, setShowShop] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [sellingPhotos, setSellingPhotos] = useState<SellingPhoto[]>([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [selectedForPurchase, setSelectedForPurchase] = useState<Set<string>>(new Set());
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  // Fetch photos from API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PhotoData[] = await response.json();
        if (data.length === 0) {
          setError('No photos available');
        } else {
          setPhotos(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch photos:', err);
        setError('Failed to load photos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    void fetchPhotos();
  }, []);

  // Fetch selling photos when shop is opened
  const fetchSellingPhotos = async () => {
    if (sellingPhotos.length > 0) return; // Already loaded
    setShopLoading(true);
    try {
      const response = await fetch('/api/selling-photos');
      if (!response.ok) throw new Error('Failed to fetch');
      const data: { photos: SellingPhoto[] } = await response.json();
      setSellingPhotos(data.photos);
    } catch (err) {
      console.error('Failed to fetch selling photos:', err);
    } finally {
      setShopLoading(false);
    }
  };

  const openShop = () => {
    setShowShop(true);
    void fetchSellingPhotos();
  };

  const togglePhotoForPurchase = (key: string) => {
    setSelectedForPurchase((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const proceedToCheckout = () => {
    if (selectedForPurchase.size > 0) {
      setShowCheckout(true);
    }
  };

  const backToShop = () => {
    setShowCheckout(false);
    setSelectedPayment(null);
  };

  const closeShop = () => {
    setShowShop(false);
    setShowCheckout(false);
    setSelectedForPurchase(new Set());
    setSelectedPayment(null);
  };

  // Handle responsive column count
  useEffect(() => {
    const updateColumnCount = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setColumnCount(4);
      } else if (window.matchMedia('(min-width: 768px)').matches) {
        setColumnCount(3);
      } else {
        setColumnCount(2);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => {
      window.removeEventListener('resize', updateColumnCount);
    };
  }, []);

  const openLightbox = (photoKey: string) => {
    const index = photos.findIndex((p) => p.key === photoKey);
    if (index !== -1) {
      setSelectedPhotoIndex(index);
    }
  };

  const splitPhotosIntoColumns = (count: number) => {
    const columns: PhotoData[][] = Array.from({ length: count }, () => []);
    photos.forEach((photo, index) => {
      const columnIndex = index % count;
      columns[columnIndex]?.push(photo);
    });
    // Triple the photos for infinite scroll effect
    return columns.map((col) => [...col, ...col, ...col]);
  };

  const photoColumns = splitPhotosIntoColumns(columnCount);

  const renderColumn = (columnPhotos: PhotoData[], columnIndex: number) => (
    <div key={columnIndex} className="overflow-hidden">
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `scroll-${columnIndex % 2 === 0 ? 'up' : 'down'} 60s linear infinite`,
        }}
      >
        {columnPhotos.map((photo, index) => (
          <div
            key={`col${columnIndex}-${photo.key}-${index}`}
            className="rounded-lg overflow-hidden shadow-sm transition-all duration-300 group relative cursor-pointer border border-transparent hover:border-gray-300 bg-gray-100"
            onClick={() => {
              openLightbox(photo.key);
            }}
            onMouseEnter={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) parent.style.animationPlayState = 'paused';
            }}
            onMouseLeave={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) parent.style.animationPlayState = 'running';
            }}
          >
            <img
              src={getThumbnailUrl(photo.url, 400)}
              alt={photo.alt}
              className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-90"
              loading={index < 4 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index < 2 ? 'high' : 'auto'}
              onError={(e) => { handleImageError(e, photo.url); }}
            />
            {/* Hover overlay - gradient only at bottom */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Info positioned bottom-left like Video page */}
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className={`${TYPOGRAPHY.cardOverlayTitle} ${COLORS.white}`}>{photo.title}</h3>
              <p className={`${TYPOGRAPHY.cardOverlayMeta} text-white/80`}>{photo.season}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const intro =
    language === 'en'
      ? 'Capturing moments of silence, texture, and light. A collection of works exploring the relationship between natural landscapes and human perception.'
      : '捕捉沉默、质感和光的瞬间。探索自然景观与人类感知之间关系的作品集。';

  // Default price per photo (USD) - used when no price is set in R2 metadata
  const defaultPrice = 25;

  const calculateTotal = () => {
    return Array.from(selectedForPurchase).reduce((total, key) => {
      const photo = sellingPhotos.find((p) => p.key === key);
      return total + (photo?.price ?? defaultPrice);
    }, 0);
  };

  const shopText = {
    en: {
      buy: 'Buy',
      shopTitle: 'Photo Shop',
      selectPhotos: 'Select photos to purchase',
      checkout: 'Checkout',
      selected: 'selected',
      noPhotos: 'No photos available for purchase.',
      loading: 'Loading...',
      backToShop: 'Back to selection',
      paymentTitle: 'Complete Your Purchase',
      paymentInstructions: 'Please pay using one of the methods below. After payment, I will send you the high-resolution photos.',
      photosSelected: 'photos selected',
      scanToPay: 'Scan to pay',
      contactAfterPayment: 'After payment, please contact me with your order details:',
      email: 'Email: Yunwustudio@gmail.com',
      total: 'Total',
      each: 'each',
    },
    zh: {
      buy: '购买',
      shopTitle: '照片商店',
      selectPhotos: '选择要购买的照片',
      checkout: '结账',
      selected: '已选择',
      noPhotos: '暂无可购买的照片。',
      loading: '加载中...',
      backToShop: '返回选择',
      paymentTitle: '完成购买',
      paymentInstructions: '请使用以下方式付款。付款后，我将发送高分辨率照片给您。',
      photosSelected: '张照片已选择',
      scanToPay: '扫码支付',
      contactAfterPayment: '付款后，请联系我并提供订单详情：',
      email: '邮箱：Yunwustudio@gmail.com',
      total: '总计',
      each: '每张',
    },
  };

  const t = shopText[language];

  if (loading) {
    return (
      <div id="photography-root" className="w-full">
        <div className="mb-12 text-center">
          <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>{intro}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[70vh]">
          {[180, 220, 160, 200].map((height, i) => (
            <div key={i} className="space-y-4">
              {[height, height + 40, height - 20].map((h, j) => (
                <div
                  key={j}
                  className="bg-gray-100 rounded-lg animate-pulse"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state - show message without fake fallback photos
  if (error || photos.length === 0) {
    return (
      <div id="photography-root" className="w-full">
        <div className="mb-12 text-center">
          <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>{intro}</p>
        </div>
        <div className="flex flex-col justify-center items-center h-[50vh] text-center">
          <p className="text-gray-500 mb-4">
            {language === 'en'
              ? (error ?? 'No photos available at the moment.')
              : (error ?? '暂时没有可用的照片。')}
          </p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            {language === 'en' ? 'Try Again' : '重试'}
          </button>
        </div>
      </div>
    );
  }

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <div id="photography-root" className="w-full">
      <div id="photography-header" className="mb-12 text-center">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray500} mb-4`}>{intro}</p>
        <button
          onClick={openShop}
          className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-white font-bold rounded-lg hover:bg-coral/90 transition-colors"
        >
          <ShoppingCart size={20} />
          {t.buy}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[70vh]">
        {photoColumns.map((columnPhotos, index) => renderColumn(columnPhotos, index))}
      </div>

      <Lightbox
        isOpen={selectedPhotoIndex !== null}
        currentIndex={selectedPhotoIndex ?? 0}
        totalItems={photos.length}
        imageUrl={selectedPhoto?.url ?? ''}
        title={selectedPhoto?.title ?? ''}
        subtitle={selectedPhoto ? `${selectedPhoto.artist} · ${selectedPhoto.season}` : ''}
        onClose={() => {
          setSelectedPhotoIndex(null);
        }}
        onNext={() => {
          setSelectedPhotoIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null));
        }}
        onPrev={() => {
          setSelectedPhotoIndex((prev) =>
            prev !== null ? (prev - 1 + photos.length) % photos.length : null
          );
        }}
      />

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {showCheckout ? (
                <button
                  onClick={backToShop}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft size={20} />
                  {t.backToShop}
                </button>
              ) : (
                <h2 className={`${TYPOGRAPHY.cardTitle} ${COLORS.gray600}`}>{t.shopTitle}</h2>
              )}
              <button
                onClick={closeShop}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className={COLORS.gray500} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {showCheckout ? (
                /* Checkout View */
                <div className="max-w-lg mx-auto">
                  <h3 className={`text-xl font-semibold ${COLORS.gray600} mb-2`}>{t.paymentTitle}</h3>
                  <p className={`${TYPOGRAPHY.body} ${COLORS.gray500} mb-6`}>
                    {t.paymentInstructions}
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <p className={`${TYPOGRAPHY.body} ${COLORS.gray600}`}>
                        {selectedForPurchase.size} {t.photosSelected}
                      </p>
                      <p className={`text-2xl font-bold ${COLORS.coral}`}>
                        ${calculateTotal()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedForPurchase).map((key) => {
                        const photo = sellingPhotos.find((p) => p.key === key);
                        return photo ? (
                          <div key={key} className="relative">
                            <img
                              src={getThumbnailUrl(photo.url, 64)}
                              alt={photo.filename}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => { handleImageError(e, photo.url); }}
                            />
                            <span className="absolute -top-1 -right-1 bg-coral text-white text-xs px-1 rounded">
                              ${photo.price ?? defaultPrice}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Payment Options - Horizontal buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Zelle', 'Venmo', 'PayPal', 'Alipay', 'WeChat', 'eBay'].map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          if (method === 'eBay') {
                            window.open('https://www.ebay.com/itm/205688493212', '_blank');
                          } else {
                            setSelectedPayment(selectedPayment === method ? null : method);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                          selectedPayment === method
                            ? 'bg-coral text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {method}
                        {method === 'eBay' && <ExternalLink size={14} />}
                      </button>
                    ))}
                  </div>

                  {/* QR Code Display */}
                  {selectedPayment && selectedPayment !== 'eBay' && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
                      <p className="font-semibold text-gray-700 mb-3">{selectedPayment}</p>
                      <img
                        src={`/images/qr/${selectedPayment.toLowerCase()}.svg`}
                        alt={`${selectedPayment} QR Code`}
                        className="w-48 h-48 mx-auto object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Try other formats
                          const formats = ['png', 'jpg', 'webp'];
                          const currentSrc = target.src;
                          const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('.'));
                          for (const fmt of formats) {
                            if (!currentSrc.endsWith(`.${fmt}`)) {
                              target.src = `${basePath}.${fmt}`;
                              return;
                            }
                          }
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        QR Code Coming Soon
                      </div>
                      <p className="text-sm text-gray-500 mt-3">{t.scanToPay}</p>
                    </div>
                  )}

                  <div className="bg-coral/10 rounded-lg p-4">
                    <p className={`${TYPOGRAPHY.body} ${COLORS.gray600}`}>
                      {t.contactAfterPayment}
                    </p>
                    <p className={`${TYPOGRAPHY.body} ${COLORS.coral} font-semibold mt-2`}>
                      {t.email}
                    </p>
                  </div>
                </div>
              ) : (
                /* Photo Selection View */
                <>
                  <p className={`${TYPOGRAPHY.body} ${COLORS.gray500} mb-4`}>{t.selectPhotos}</p>

                  {shopLoading ? (
                    <div className="flex justify-center items-center h-48">
                      <p className={COLORS.gray400}>{t.loading}</p>
                    </div>
                  ) : sellingPhotos.length === 0 ? (
                    <div className="flex justify-center items-center h-48">
                      <p className={COLORS.gray400}>{t.noPhotos}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {sellingPhotos.map((photo) => {
                        const isSelected = selectedForPurchase.has(photo.key);
                        return (
                          <div
                            key={photo.key}
                            onClick={() => { togglePhotoForPurchase(photo.key); }}
                            className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all bg-gray-100 ${
                              isSelected ? 'border-coral' : 'border-transparent hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={getThumbnailUrl(photo.url, 300)}
                              alt={photo.filename}
                              className="w-full aspect-square object-cover"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => { handleImageError(e, photo.url); }}
                            />
                            {/* Selection indicator */}
                            <div
                              className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-coral border-coral'
                                  : 'bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              {isSelected && <CheckCircle size={16} className="text-white" />}
                            </div>
                            {/* Price badge */}
                            <div className="absolute top-2 right-2 bg-coral text-white text-xs font-bold px-2 py-1 rounded">
                              ${photo.price ?? defaultPrice}
                            </div>
                            {/* Filename */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                              <p className="text-white text-xs truncate">{photo.filename}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!showCheckout && selectedForPurchase.size > 0 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <p className={`${TYPOGRAPHY.body} ${COLORS.gray600}`}>
                    {selectedForPurchase.size} {t.selected}
                  </p>
                  <p className={`text-lg font-bold ${COLORS.coral}`}>
                    {t.total}: ${calculateTotal()}
                  </p>
                </div>
                <button
                  onClick={proceedToCheckout}
                  className="px-6 py-3 bg-coral text-white font-semibold rounded-lg hover:bg-coral/90 transition-colors"
                >
                  {t.checkout}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Photography;
