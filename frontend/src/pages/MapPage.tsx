import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { Asset, CitizenReport } from '../types';
import { GoogleMapView } from '../components/map/GoogleMapView';

export const MapPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assetData, reportData] = await Promise.all([
          ApiService.getAssets(),
          ApiService.getCitizenReports()
        ]);
        setAssets(assetData);
        setCitizenReports(reportData);
      } catch (err) {
        console.error('Failed to load map data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-zinc-100 relative overflow-hidden">
      <GoogleMapView
        assets={assets}
        citizenReports={citizenReports}
        height="calc(100vh - 4rem)"
      />
    </div>
  );
};
