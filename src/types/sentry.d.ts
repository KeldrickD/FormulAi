declare module '@sentry/nextjs' {
  export interface User {
    id?: string;
    email?: string;
    username?: string;
    [key: string]: any;
  }

  export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

  export interface Breadcrumb {
    type?: string;
    category?: string;
    message?: string;
    data?: Record<string, any>;
    level?: SeverityLevel;
  }

  export interface Event {
    event_id?: string;
    message?: string;
    exception?: {
      values?: Array<{
        type?: string;
        value?: string;
        stacktrace?: {
          frames?: Array<{
            filename?: string;
            lineno?: number;
            colno?: number;
            function?: string;
            in_app?: boolean;
          }>;
        };
      }>;
    };
    level?: SeverityLevel;
    extra?: Record<string, any>;
    tags?: Record<string, string>;
    user?: User;
    breadcrumbs?: Breadcrumb[];
    [key: string]: any;
  }

  export interface Scope {
    setUser(user: User | null): Scope;
    setTag(key: string, value: string): Scope;
    setExtra(key: string, value: any): Scope;
    setLevel(level: SeverityLevel): Scope;
    addBreadcrumb(breadcrumb: Breadcrumb): void;
    [key: string]: any;
  }

  export interface Transaction {
    finish(): void;
    [key: string]: any;
  }

  export interface InitOptions {
    dsn: string;
    environment?: string;
    release?: string;
    debug?: boolean;
    tracesSampleRate?: number;
    ignoreErrors?: (string | RegExp)[];
    beforeSend?(event: Event): Event | null;
    [key: string]: any;
  }

  export function init(options: InitOptions): void;
  export function captureException(exception: any): string;
  export function captureMessage(message: string, level?: SeverityLevel): string;
  export function withScope(callback: (scope: Scope) => void): void;
  export function addBreadcrumb(breadcrumb: Breadcrumb): void;
  export function setUser(user: User | null): void;
  export function startTransaction(context: { name: string; data?: Record<string, any> }): Transaction;
} 