import { CitizenWallet, CitizenReward, CitizenLeaderboardItem } from '../types';
import { ApiService } from './api';

export const RewardService = {
  getWallet: (): Promise<CitizenWallet> => ApiService.getCitizenWallet(),
  getRewards: (): Promise<CitizenReward[]> => ApiService.getCitizenRewards(),
  redeemPoints: (points: number) => ApiService.redeemCitizenPoints(points),
  getLeaderboard: (): Promise<CitizenLeaderboardItem[]> => ApiService.getCitizenLeaderboard(),
};
