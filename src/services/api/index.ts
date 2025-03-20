/**
 * API Service Index
 * Centralizes all API services for easy importing
 */

// Export all service instances
export { kpiService } from './kpiService';
export { requirementService } from './requirementService';
export { salesService } from './salesService';
export { weeklyDataService } from './weeklyDataService';

// Export all service interfaces
export type { Kpi, KpiType, KpiActionProgress, KpiSkillsetProgress } from './kpiService';
export type { Requirement, RequirementProgress } from './requirementService';
export type { 
  SalesUser, 
  DashboardSalesUser, 
  UpdateSalesMentorData 
} from './salesService';
export type { 
  Week, 
  WeekData, 
  KpiAction, 
  KpiSkillset, 
  RequirementItem, 
  RequirementCount,
  CodeOfHonorStatus,
  MentorNote,
  SummaryMetrics
} from './weeklyDataService';

// Export utility functions
export { tryCatchWrapper, makeApiRequest, apiCache } from './xanoClient';

// API Client exports
export * from './xanoClient';

// Service exports
export * from './authService';
export * from './userService';
export * from './targetService';
export * from '../rankService';

// Additional exports can be added as more services are created 