# Xano Service Refactoring Plan

## Problem

The current `xanoService.ts` file is almost 2,000 lines of code, making it difficult to maintain, navigate, and test. The file contains several distinct functional areas that should be separated for better code organization.

## Refactoring Approach

We've broken down the monolithic `xanoService.ts` file into smaller, more focused modules:

1. `src/services/api/xanoClient.ts` - Base API client with common utilities
2. `src/services/api/authService.ts` - Authentication functions
3. `src/services/api/userService.ts` - User management functions
4. `src/services/api/salesService.ts` - Sales and mentor management
5. `src/services/api/targetService.ts` - Target management functions
6. `src/services/api/kpiService.ts` - KPI tracking functions
7. `src/services/api/requirementService.ts` - Requirement progress tracking

Each service file focuses on a specific domain of functionality and imports the base utilities from `xanoClient.ts`.

## Compatibility Layer

To ensure a smooth transition without breaking existing code, we've created a compatibility layer in `xanoService.ts` that:

1. Imports all the modular services
2. Re-exports the same interface as the original `xanoService` object
3. Delegates function calls to the appropriate service modules

## Migration Steps

### Step 1: Setup Modular Architecture
- [x] Create base API client in `xanoClient.ts`
- [x] Create domain-specific service files
- [x] Create barrel file in `src/services/api/index.ts`
- [x] Create compatibility layer in `xanoService.ts.new`

### Step 2: Transition
- [x] Rename `xanoService.ts` to `xanoService.ts.old`
- [x] Rename `xanoService.ts.new` to `xanoService.ts`
- [ ] Test the application to ensure everything works as expected
- [ ] Update imports in existing files if needed (should be minimal)

### Step 3: Complete Refactoring
- [x] Move remaining functions from the compatibility layer to appropriate service files
- [x] Add more domain-specific service files as needed (kpiService, requirementService, etc.)
- [x] Update the compatibility layer to delegate to these new services

### Step 4: Documentation and Cleanup
- [x] Update documentation to reflect the new architecture
- [x] Add inline documentation for all services and functions
- [ ] Remove `xanoService.ts.old` after sufficient testing

## Benefits of Refactoring

1. **Improved Maintainability**: Smaller files focused on specific domains are easier to understand and maintain.
2. **Better Code Organization**: Clear separation of concerns with domain-specific modules.
3. **Enhanced Testability**: Easier to write unit tests for smaller, focused modules.
4. **Clearer Dependencies**: Each module clearly states its dependencies.
5. **Easier Onboarding**: New developers can understand smaller modules more easily.
6. **Parallel Development**: Multiple developers can work on different services simultaneously.

## Service Structure

### xanoClient.ts
- Base API configuration
- Axios instance setup
- Authentication interceptors
- Error handling utilities
- Request caching implementation
- Generic API request functions

### authService.ts
- User registration (signup)
- User authentication (login)
- Session management (logout)
- Current user data retrieval

### userService.ts
- User listing and management
- User profile operations
- Connection testing

### salesService.ts
- Sales user management
- Mentor assignment operations
- Sales user filtering and querying
- Table schema validation

### targetService.ts
- Target summary operations
- Target details management
- Target creation and updates

### kpiService.ts
- KPI listing and retrieval
- Current week operations
- KPI progress tracking
- Progress attachment handling

### requirementService.ts
- Requirement progress tracking
- Progress attachment handling
- Progress updates and deletion

## Best Practices Going Forward

1. Keep each service file focused on a single domain or concern
2. Use the shared utilities from `xanoClient.ts` for API requests and error handling
3. Add new functionality to the appropriate domain-specific service file
4. Maintain meaningful documentation and type definitions
5. Update the compatibility layer when adding new services 