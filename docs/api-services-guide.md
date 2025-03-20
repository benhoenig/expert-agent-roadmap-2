# API Services Guide

## Overview

This project uses a modular API service architecture to interact with the Xano backend. The services are organized by domain and share common utilities for API requests, error handling, and caching.

## Service Structure

The API services are organized as follows:

- **xanoClient.ts**: Base API client with configuration, authentication, caching, and error handling
- **authService.ts**: Authentication and user session management
- **userService.ts**: User account management
- **salesService.ts**: Sales user and mentor assignment management
- **targetService.ts**: Target setting and management
- **kpiService.ts**: KPI tracking and progress
- **requirementService.ts**: Requirement progress tracking

## How to Use

### Compatibility Layer

For backward compatibility, all services are exposed through the `xanoService` object:

```typescript
import { xanoService } from '@/services/xanoService';

// Authentication
await xanoService.login({ username: 'user', password: 'pass' });

// User management
const users = await xanoService.getUsers();

// Sales management
const salesUsers = await xanoService.getSalesUsers();
```

### Direct Service Usage

For new code, you can import services directly from their modules:

```typescript
import { authService, userService } from '@/services/api';

// Authentication
await authService.login({ username: 'user', password: 'pass' });

// User management
const users = await userService.getUsers();
```

This approach is preferred for new code as it provides better code organization and reduces bundle size.

### Utility Functions

The API clients expose several utility functions for common tasks:

```typescript
import { 
  makeApiRequest, 
  getAuthToken, 
  apiCache 
} from '@/services/api';

// Make a request with caching
const data = await makeApiRequest('get', '/some-endpoint', { param: 'value' });

// Clear cache
apiCache.clear();

// Get the current auth token
const token = getAuthToken();
```

## Service Details

### Authentication Service

The `authService` provides functions for user authentication:

```typescript
import { authService } from '@/services/api';

// Register a new user
await authService.signup({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password',
  role: 'sales'
});

// Login
const response = await authService.login({
  username: 'user',
  password: 'pass'
});

// Store token from login response
localStorage.setItem('xano_token', response.authToken);
// OR for session-only storage
sessionStorage.setItem('xano_token', response.authToken);

// Logout (clears tokens)
authService.logout();

// Get current user data
const currentUser = await authService.getUserData();
```

### User Service

The `userService` provides functions for user management:

```typescript
import { userService } from '@/services/api';

// Get all users
const users = await userService.getUsers();

// Get user by ID
const user = await userService.getUserById(123);

// Update user
await userService.updateUser(123, {
  email: 'newemail@example.com',
  full_name: 'Updated Name'
});

// Test API connection
const connectionStatus = await userService.testConnection();
```

### Sales Service

The `salesService` provides functions for sales user management and mentor assignments:

```typescript
import { salesService } from '@/services/api';

// Get all sales users
const salesUsers = await salesService.getSalesUsers();

// Get sales assigned to a mentor
const mentorSales = await salesService.getSalesByMentor(mentorId);

// Get unassigned sales
const unassignedSales = await salesService.getUnassignedSales();

// Assign mentor to sales
await salesService.assignMentorToSales(salesId, mentorId);

// Unassign mentor from sales
await salesService.unassignMentorFromSales(salesId);

// Batch update mentor assignments
await salesService.updateSalesMentorAssignments(mentorId, [salesId1, salesId2]);
```

### Target Service

The `targetService` provides functions for managing targets:

```typescript
import { targetService } from '@/services/api';

// Get target summaries
const targetSummaries = await targetService.getTargetSummaries();

// Get target details
const targetDetails = await targetService.getTargetDetails(weekId, salesId);

// Create targets
await targetService.createTargets({
  week_id: weekId,
  sales_id: salesId,
  action_kpis: [...],
  skillset_kpis: [...],
  requirements: [...]
});

// Update targets
await targetService.updateTargets({
  week_id: weekId,
  sales_id: salesId,
  action_kpis: [...],
  skillset_kpis: [...],
  requirements: [...]
});

// Delete targets
await targetService.deleteTargets(weekId, salesId);
```

### KPI Service

The `kpiService` provides functions for KPI management:

```typescript
import { kpiService } from '@/services/api';

// Get all KPIs
const kpis = await kpiService.getAllKPIs();

// Get KPI by ID
const kpi = await kpiService.getKPIById(kpiId);

// Get current week
const currentWeek = await kpiService.getCurrentWeek();

// Get all KPI progress
const progressRecords = await kpiService.getAllKPIProgress();

// Add KPI progress
await kpiService.addKPIProgress({
  date: new Date(),
  kpi_type: 'Skillset',
  kpi_name: 'Call Quality',
  kpi_id: 1,
  wording_score: 8,
  tonality_score: 9,
  rapport_score: 7,
  user_id: 123
});

// Update KPI progress
await kpiService.updateKPIProgress(progressId, {
  wording_score: 9,
  remark: 'Updated score'
});

// Delete KPI progress
await kpiService.deleteKPIProgress(progressId);
```

### Requirement Service

The `requirementService` provides functions for requirement progress tracking:

```typescript
import { requirementService } from '@/services/api';

// Add requirement progress
await requirementService.addRequirementProgress({
  user_id: 123,
  week_id: 5,
  requirement_id: 2,
  date_added: new Date().toISOString(),
  count: 1,
  lesson_learned: 'Learned about effective closing techniques',
  updated_at: new Date().toISOString(),
  mentor_edited: 0
});

// Get all requirement progress
const requirements = await requirementService.getAllRequirementProgress();

// Get requirement progress by ID
const requirement = await requirementService.getRequirementProgressById(reqId);

// Update requirement progress
await requirementService.updateRequirementProgress(reqId, {
  count: 2,
  lesson_learned: 'Updated lesson notes'
});

// Delete requirement progress
await requirementService.deleteRequirementProgress(reqId);
```

## Error Handling

All service functions include proper error handling and will throw descriptive errors when issues occur. You should wrap API calls in try/catch blocks:

```typescript
try {
  const users = await userService.getUsers();
  // Handle successful response
} catch (error) {
  console.error('Error fetching users:', error);
  // Handle error case
}
```

## Caching

The API client includes built-in caching for GET requests. You can control cache behavior with the options parameter:

```typescript
import { makeApiRequest } from '@/services/api';

// Use default caching (5 minutes)
const data = await makeApiRequest('get', '/endpoint', null);

// Disable caching
const freshData = await makeApiRequest('get', '/endpoint', null, { 
  useCache: false 
});

// Force refresh
const refreshedData = await makeApiRequest('get', '/endpoint', null, { 
  forceRefresh: true 
});

// Custom cache TTL (2 minutes)
const data = await makeApiRequest('get', '/endpoint', null, { 
  cacheTTL: 120000 
});
```

To clear the cache, use:

```typescript
import { apiCache } from '@/services/api';

// Clear entire cache
apiCache.clear();

// Clear specific endpoints
apiCache.invalidate('/users');
``` 