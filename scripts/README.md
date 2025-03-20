# Scripts for Home Sales Manual

This directory contains utility scripts for managing the Home Sales Manual application.

## checkAndGenerateWeeks.mjs

This script checks all sales users in the database and generates missing week records for users who don't have weeks created. It uses the application's existing architecture and services to maintain code consistency.

### Prerequisites

- Node.js installed on your machine
- Valid Xano authentication token (via login to the application)

### Usage

1. Log in to the application first to set the authentication token
2. Run the script:

```bash
node scripts/checkAndGenerateWeeks.mjs
```

### Benefits of this script

This script properly follows software engineering best practices:

- **DRY (Don't Repeat Yourself)**: Uses existing functions from the weeklyDataService
- **SSOT (Single Source of Truth)**: Leverages the application's authentication and API client
- **Modular Architecture**: Extends the existing service with a new function that follows the same patterns

### What the script does

1. Fetches all sales users from the Xano database
2. For each sales user:
   - Checks if they already have week records
   - If no weeks exist, generates 12 weeks based on their starting_date
   - Logs detailed information about the process

### Troubleshooting

If you see errors like:

```
ERROR: No authentication token found.
```

This means you need to log in to the application first to set the authentication token.

```
Error processing sales ID X
```

This indicates an issue with specific sales users. Check the logs for more details.

If you encounter rate limiting, the script includes delays between requests to minimize this issue, but you may need to increase the delay values in the `generateMissingWeeksForAllSales` function if you still encounter problems.

### Note on Removed Legacy Scripts

Several legacy scripts for generating week records were previously available in this directory:
- `generateWeeks.js` (Node.js implementation)
- `generateWeeks.mjs` (ES Modules implementation)
- `generateWeeks.sh` (Bash shell script implementation)
- `run-generate-weeks.sh` (Helper script)

These were removed because they:
1. Duplicated functionality that already exists in the application
2. Operated outside the application's architecture
3. Created multiple implementations of the same logic

The functionality has been properly integrated into the application's architecture via the `generateMissingWeeksForAllSales` function in `weeklyDataService.ts` and exposed through the `checkAndGenerateWeeks.mjs` script. 