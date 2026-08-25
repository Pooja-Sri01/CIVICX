import { DashboardSummary, OptimizationResult, SimulationResult } from '../types';
import { ApiService } from './api';

export const AnalyticsService = {
  getDashboardSummary: (): Promise<DashboardSummary> => ApiService.getDashboardSummary(),
  optimizeBudget: (budget: number): Promise<OptimizationResult> => ApiService.optimizeBudget(budget),
  simulateAsset: (assetId: string | number): Promise<SimulationResult> => ApiService.runSimulation(String(assetId)),
};
