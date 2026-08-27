/**
 * Photographic Telemetry and User Evidence utilities for CIVICX
 */

/**
 * Checks if a given image URL represents a genuine citizen or field inspection upload
 * (e.g. data URI, local blob, or municipal upload), rather than an external stock/placeholder URL.
 */
export const isUserUploadedPhoto = (imageUrl?: string | null): boolean => {
  if (!imageUrl || typeof imageUrl !== 'string') return false;
  const clean = imageUrl.trim();
  if (clean.length === 0) return false;
  
  // Do NOT treat stock unsplash / pexels / placeholder URLs as genuine user uploads
  if (clean.includes('unsplash.com') || clean.includes('pexels.com') || clean.includes('placeholder')) {
    return false;
  }

  // Base64 Data URI from file upload, local blob, or uploaded asset path
  return clean.startsWith('data:image/') || clean.startsWith('blob:') || clean.startsWith('/uploads/');
};

/**
 * Safely returns the image URL only if it is a genuine upload, otherwise null.
 */
export const getAssetImage = (imageUrl?: string | null, _assetType: string = 'Road'): string => {
  if (isUserUploadedPhoto(imageUrl)) {
    return (imageUrl as string).trim();
  }
  return '';
};

/**
 * Standard image load error fallback: hides broken image element safely.
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  _assetType: string = 'Road'
) => {
  e.currentTarget.style.display = 'none';
};
