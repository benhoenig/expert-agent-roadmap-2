#!/usr/bin/env node

// Import required modules
import dotenv from 'dotenv';
import { weeklyDataService } from '../src/services/api/weeklyDataService.js';
import { getAuthToken } from '../src/services/api/xanoClient.js';

// Load environment variables
dotenv.config();

// Log helper
const log = (message) => console.log(`[CheckAndGenerateWeeks] ${message}`);

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Check for auth token
    const token = getAuthToken();
    if (!token) {
      log('ERROR: No authentication token found. Please make sure you have a valid token in localStorage or sessionStorage.');
      log('You can set this by logging in to the application first.');
      process.exit(1);
    }
    
    log('Starting check for missing weeks across all sales users...');
    log('Using authentication token: ' + token.substring(0, 10) + '...');
    
    // Use the existing service function to generate missing weeks
    const summary = await weeklyDataService.generateMissingWeeksForAllSales();
    
    // Log results
    log('COMPLETED!');
    log('-------------------------');
    log(`Total sales users processed: ${summary.totalUsers}`);
    log(`Users with existing weeks: ${summary.usersWithWeeks}`);
    log(`Users without weeks (processed): ${summary.usersWithoutWeeks}`);
    log(`Users without starting date (skipped): ${summary.usersWithoutStartDate}`);
    log(`Total new weeks generated: ${summary.weeksGenerated}`);
    log(`Errors encountered: ${summary.errors}`);
    log('-------------------------');
    
    if (summary.errors > 0) {
      log('WARNING: Some errors occurred during processing. Check the logs for details.');
      process.exit(1);
    } else {
      log('SUCCESS: All sales users processed successfully.');
      process.exit(0);
    }
  } catch (error) {
    log(`ERROR: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main(); 