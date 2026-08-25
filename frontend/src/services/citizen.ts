import { CitizenReport, CitizenReportCreateInput } from '../types';
import { ApiService } from './api';

export const CitizenService = {
  getReports: (): Promise<CitizenReport[]> => ApiService.getCitizenReports(),
  submitReport: (input: CitizenReportCreateInput): Promise<CitizenReport> => ApiService.submitCitizenReport(input),
  getReportById: (id: string | number): Promise<CitizenReport | undefined> => ApiService.getCitizenReportById(id),
};
