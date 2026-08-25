import { AssetDecisionReportData, PortfolioDecisionReportData } from '../types';
import { ApiService } from './api';

export const DecisionReportService = {
  getAssetReport: (assetId: string | number): Promise<AssetDecisionReportData> =>
    ApiService.getAssetDecisionReport(String(assetId)),
  getPortfolioReport: (): Promise<PortfolioDecisionReportData> => ApiService.getPortfolioDecisionReport(),
};
