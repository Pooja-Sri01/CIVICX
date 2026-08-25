import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, Check } from 'lucide-react';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  onLocationChange: (lat: number, lng: number, locationName: string) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  locationName,
  onLocationChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [latitude || 11.0168, longitude || 76.9673],
      zoom: 14,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    const customPin = L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(159, 255, 0, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #1A1A1A; border: 2.5px solid #9FFF00; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; color: #9FFF00; font-size: 14px; z-index: 10;">
            📍
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = L.marker([latitude || 11.0168, longitude || 76.9673], {
      icon: customPin,
      draggable: true
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onLocationChange(pos.lat, pos.lng, `Coimbatore Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng, `Coimbatore Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`);
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker position when external lat/lng changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        onLocationChange(lat, lng, `Current GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed', err);
        setIsLocating(false);
        // Fallback center
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([11.0168, 76.9673], 14);
          markerRef.current.setLatLng([11.0168, 76.9673]);
        }
        onLocationChange(11.0168, 76.9673, 'Central Coimbatore, Tamil Nadu');
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-mono font-bold text-slate-900 truncate">
            {locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
          </span>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-xs font-bold border border-blue-200 transition-colors"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Acquiring GPS...' : 'Use Current Location'}</span>
        </button>
      </div>

      <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 z-[500] px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-200 text-[10px] font-mono text-slate-700 font-bold shadow-sm pointer-events-none">
          Click anywhere or drag pin to adjust location
        </div>
      </div>
    </div>
  );
};
