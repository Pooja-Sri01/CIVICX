import { Asset } from '../types';
import { ApiService } from './api';

export const AssetService = {
  getAssets: (): Promise<Asset[]> => ApiService.getAssets(),
  getAssetById: (id: string | number): Promise<Asset> => ApiService.getAssetById(String(id)),
  getPriorities: (): Promise<any[]> => ApiService.getPriorities(),
};
