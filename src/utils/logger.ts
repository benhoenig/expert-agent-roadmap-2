/**
 * Custom logger utility for consistent formatting and better visibility in console
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type ServiceType = 
  | 'SalesService' 
  | 'WeeklyDataService' 
  | 'RankService'
  | 'AuthService'
  | 'Component';

interface LogStyles {
  [key: string]: string;
}

const serviceColors: LogStyles = {
  SalesService: 'color: #4CAF50; font-weight: bold',        // Green
  WeeklyDataService: 'color: #2196F3; font-weight: bold',   // Blue
  RankService: 'color: #9C27B0; font-weight: bold',         // Purple
  AuthService: 'color: #FF9800; font-weight: bold',         // Orange
  Component: 'color: #E91E63; font-weight: bold',           // Pink
  default: 'color: #607D8B; font-weight: bold'              // Blue Grey
};

const levelColors: LogStyles = {
  info: 'background: #E8F5E9; color: #388E3C; padding: 2px 5px; border-radius: 3px',
  warn: 'background: #FFF3E0; color: #E64A19; padding: 2px 5px; border-radius: 3px',
  error: 'background: #FFEBEE; color: #D32F2F; padding: 2px 5px; border-radius: 3px',
  debug: 'background: #E3F2FD; color: #1976D2; padding: 2px 5px; border-radius: 3px'
};

/**
 * Enhanced console logger with visual formatting
 * @param service - The service or component name
 * @param level - Log level (info, warn, error, debug)
 * @param message - The message to log
 * @param data - Optional data to include
 */
export const Logger = {
  log: (
    service: ServiceType | string,
    level: LogLevel,
    message: string,
    ...data: any[]
  ) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const serviceColor = serviceColors[service as ServiceType] || serviceColors.default;
    const levelColor = levelColors[level];
    
    const hasData = data.length > 0;
    
    if (hasData) {
      console.groupCollapsed(
        `%c[${timestamp}] %c${service} %c${level.toUpperCase()}%c: ${message}`,
        'color: gray',
        serviceColor,
        levelColor,
        'color: black'
      );
      data.forEach(item => {
        if (typeof item === 'object') {
          console.dir(item);
        } else {
          console.log(item);
        }
      });
      console.groupEnd();
    } else {
      console.log(
        `%c[${timestamp}] %c${service} %c${level.toUpperCase()}%c: ${message}`,
        'color: gray',
        serviceColor,
        levelColor,
        'color: black'
      );
    }
  },
  
  // Convenience methods
  info: (service: ServiceType | string, message: string, ...data: any[]) => 
    Logger.log(service, 'info', message, ...data),
    
  warn: (service: ServiceType | string, message: string, ...data: any[]) => 
    Logger.log(service, 'warn', message, ...data),
    
  error: (service: ServiceType | string, message: string, ...data: any[]) => 
    Logger.log(service, 'error', message, ...data),
    
  debug: (service: ServiceType | string, message: string, ...data: any[]) => 
    Logger.log(service, 'debug', message, ...data),
};

export default Logger; 