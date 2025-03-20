/**
 * Xano API Service
 * 
 * This is a compatibility layer that re-exports all the modular services
 * from their individual files. It allows a smooth transition from the
 * monolithic service to the modular one without breaking existing code.
 * 
 * IMPORTANT: This file identifies and fixes several architectural violations:
 * - Fixes DRY violations by using proper service functions
 * - Ensures SSOT by using definitive service implementations
 * - Maintains modular architecture with clear responsibilities
 */

import { 
  // Base API utilities
  getAuthToken, 
  xanoApi,
  makeApiRequest,
  tryCatchWrapper,
  apiCache,
  formatApiError,
} from './api/xanoClient';

// Import services explicitly to ensure TypeScript validates property access
import { authService } from './api/authService';
import { userService } from './api/userService';
import { salesService } from './api/salesService';
import { targetService } from './api/targetService';
import { kpiService } from './api/kpiService';
import { requirementService } from './api/requirementService';
import { weeklyDataService } from './api/weeklyDataService';

// Re-export all types from the modular services
export type { SalesUser, UpdateSalesMentorData } from './api/salesService';
export type { TargetSummary, TargetDetails, TargetData } from './api/targetService';
export type { Kpi, KpiType, KpiActionProgress, KpiSkillsetProgress } from './api/kpiService';
export type { Week, WeekData, SummaryMetrics } from './api/weeklyDataService';

/**
 * The main xanoService object that combines all the modular services
 * This maintains compatibility with existing code that uses xanoService
 */
export const xanoService = {
  // Auth functions
  signup: authService.signup,
  login: authService.login,
  logout: authService.logout,
  getUserData: authService.getUserData,
  
  // User management functions
  getUsers: userService.getUsers,
  getUserById: userService.getUserById,
  updateUser: userService.updateUser,
  createUser: userService.createUser,
  deleteUser: userService.deleteUser,
  createSalesProfile: userService.createSalesProfile,
  updateSalesProfile: userService.updateSalesProfile,
  testConnection: userService.testConnection,
  
  // Sales and mentor management functions
  getSalesById: salesService.getSalesById,
  createSales: salesService.createSales,
  updateSales: salesService.updateSales,
  deleteSales: salesService.deleteSales,
  createSalesWithWeeks: salesService.createSalesWithWeeks,
  checkAndGenerateWeeksForSales: salesService.checkAndGenerateWeeksForSales,
  getSalesUsers: salesService.getSalesUsers,
  getSalesByMentor: salesService.getSalesByMentor,
  getDashboardSalesByMentor: salesService.getDashboardSalesByMentor,
  
  // Weekly data functions
  getAllWeeks: weeklyDataService.getAllWeeks,
  getWeekById: weeklyDataService.getWeekById,
  // Using weeklyDataService implementation as it's more appropriate for this functionality
  getCurrentWeek: weeklyDataService.getCurrentWeek,
  getWeeksBySalesId: weeklyDataService.getWeeksBySalesId,
  getWeeksBySalesIdRaw: weeklyDataService.getWeeksBySalesIdRaw,
  generateWeeksForSales: weeklyDataService.generateWeeksForSales,
  generateMissingWeeksForAllSales: weeklyDataService.generateMissingWeeksForAllSales,
  getSalesSummaryMetrics: weeklyDataService.getSalesSummaryMetrics,
  
  // Target management functions
  getTargetSummaries: targetService.getTargetSummaries,
  getTargetDetails: targetService.getTargetDetails,
  createTargets: targetService.createTargets,
  updateTargets: targetService.updateTargets,
  deleteTargets: targetService.deleteTargets,
  
  // KPI management functions
  getAllKpis: kpiService.getAllKpis,
  getKpiById: kpiService.getKpiById,
  getAllKPIProgress: kpiService.getAllKPIProgress,
  getKPIProgressById: kpiService.getKPIProgressById,
  addKPIProgress: kpiService.addKPIProgress,
  updateKPIProgress: kpiService.updateKPIProgress,
  deleteKPIProgress: kpiService.deleteKPIProgress,
  
  // Requirement functions
  getAllRequirements: requirementService.getAllRequirements,
  getRequirementById: requirementService.getRequirementById,
  
  // Requirement progress functions
  addRequirementProgress: requirementService.addRequirementProgress,
  getAllRequirementProgress: requirementService.getAllRequirementProgress,
  getRequirementProgressById: requirementService.getRequirementProgressById,
  updateRequirementProgress: requirementService.updateRequirementProgress,
  deleteRequirementProgress: requirementService.deleteRequirementProgress,
  
  // Cache utility functions
  clearCache: (pattern = '') => {
    if (pattern) {
      apiCache.invalidate(pattern);
    } else {
      apiCache.clear();
    }
    console.log(`Cache ${pattern ? 'partially' : 'completely'} cleared`);
  },
};

// Export base utilities for direct use if needed
export { getAuthToken, xanoApi, makeApiRequest, apiCache }; 