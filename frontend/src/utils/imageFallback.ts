/**
 * High-reliability fallback images and error handlers for CIVICX infrastructure asset types
 */

// Offline-safe SVG Fallback Data URI in CIVICX high-tech styling
const generateSvgFallback = (type: string, accentColor: string = '#a3e635') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#09090b"/>
        <stop offset="50%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="450" fill="url(#bg)"/>
    <rect width="800" height="450" fill="url(#grid)" opacity="0.6"/>
    <circle cx="400" cy="180" r="48" fill="#18181b" stroke="${accentColor}" stroke-width="2"/>
    <path d="M 376 180 L 424 180 M 400 156 L 400 204" stroke="${accentColor}" stroke-width="3" stroke-linecap="round"/>
    <text x="400" y="270" text-anchor="middle" fill="#ffffff" font-family="-apple-system, sans-serif" font-weight="800" font-size="20" letter-spacing="1">CIVICX INFRASTRUCTURE TELEMETRY</text>
    <text x="400" y="300" text-anchor="middle" fill="${accentColor}" font-family="monospace" font-weight="700" font-size="14" letter-spacing="2">${type.toUpperCase()} • FIELD SENSOR RECORD</text>
    <text x="400" y="330" text-anchor="middle" fill="#71717a" font-family="-apple-system, sans-serif" font-size="12">Coimbatore Municipal Corporation</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const ASSET_TYPE_FALLBACK_IMAGES: Record<string, string> = {
  Road: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80',
  Bridge: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80',
  Drainage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
  Culvert: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
  Flyover: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=1000&q=80',
  'Public Facility': 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
  'Traffic Corridor': 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1000&q=80',
  'Street Infrastructure': 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1000&q=80',
  Pothole: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80',
  Streetlight: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1000&q=80',
  Water: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
  Garbage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
  Other: 'https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?auto=format&fit=crop&w=1000&q=80'
};

// Known dead or unrelated Unsplash image IDs to automatically intercept and replace
const DEAD_IMAGE_URL_PATTERNS = [
  'photo-1541888946425-d0fbb180c5f5',
  'photo-1541888946425-d0fbb186156a',
  'photo-1578964777085-78e72765d7fe',
  'photo-1584463623578-3019313264c7',
  'photo-1517649763962-0c623266ddc0',
  'photo-1515162816999-a0c47dc192f7', // Silhouette airplane glass
  'photo-1578991624414-276ef23a534f', // Indoor office Smartworks lobby
  'photo-1545459720-aac8509eb02c', // Manhole cartoon cover
  'photo-1544620347-c4fd4a3d5957'  // Mountain bus
];

export const getAssetImage = (imageUrl?: string | null, assetType: string = 'Road'): string => {
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
    const cleanUrl = imageUrl.trim();
    // Check if this is a known dead Unsplash URL
    const isDead = DEAD_IMAGE_URL_PATTERNS.some(deadId => cleanUrl.includes(deadId));
    if (!isDead && (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('/'))) {
      return cleanUrl;
    }
  }

  // Look up categorized fallback
  const matchedType = Object.keys(ASSET_TYPE_FALLBACK_IMAGES).find(
    k => k.toLowerCase() === (assetType || '').toLowerCase()
  );
  if (matchedType) {
    return ASSET_TYPE_FALLBACK_IMAGES[matchedType];
  }

  return ASSET_TYPE_FALLBACK_IMAGES.Road;
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  assetType: string = 'Road'
) => {
  const currentSrc = e.currentTarget.src || '';
  const onlineFallback = getAssetImage('', assetType);
  const svgFallback = generateSvgFallback(assetType);

  if (!currentSrc.includes(onlineFallback) && !currentSrc.startsWith('data:')) {
    e.currentTarget.src = onlineFallback;
  } else if (!currentSrc.startsWith('data:')) {
    e.currentTarget.src = svgFallback;
  }
};
