/**
 * Generic API response wrapper
 * @template T - Type of the data payload
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  status?: number;
}

/**
 * Paginated response data structure
 * @template T - Type of items in the data array
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  message: string;
  code?: string | number;
  status?: number;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

/**
 * Loading states for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * Generic async state
 * @template T - Type of the data
 */
export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: ErrorResponse | null;
  timestamp?: number;
}

/**
 * Form errors type for form validation
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Generic form data type
 */
export type FormData<T> = {
  [K in keyof T]: T[K];
};

/**
 * Common UI component props
 */
export interface UIComponentProps {
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

/**
 * Makes all properties in T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes all properties in T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Makes all properties in T nullable
 */
export type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 * Makes all properties in T optional and nullable
 */
export type Optional<T> = { [P in keyof T]?: T[P] | null | undefined };

/**
 * Makes properties K in T required and non-nullable
 */
export type NonNullableField<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: NonNullable<T[P]>;
};

/**
 * Type for React functional components with props
 */
export type FCWithChildren<P = unknown> = React.FC<
  P & {
    children?: React.ReactNode;
  }
>;

/**
 * Type for React functional components with className
 */
export type StyledFC<P = unknown> = React.FC<P & { className?: string }>;

/**
 * Type for React functional components with children and className
 */
export type StyledFCWithChildren<P = unknown> = React.FC<
  P & {
    children?: React.ReactNode;
    className?: string;
  }
>;
