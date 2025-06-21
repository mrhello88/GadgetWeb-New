import { useCallback } from 'react';
import { toast } from 'react-toastify';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  customMessage?: string;
}

interface ApiError {
  message: string;
  statusCode?: number;
  data?: any;
}

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: unknown, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logToConsole = true,
      customMessage
    } = options;

    let errorMessage = 'An unexpected error occurred';
    let statusCode: number | undefined;

    // Handle different error types
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      const apiError = error as ApiError;
      if (apiError.message) {
        errorMessage = apiError.message;
        statusCode = apiError.statusCode;
      }
    }

    // Use custom message if provided
    if (customMessage) {
      errorMessage = customMessage;
    }

    // Log to console in development
    if (logToConsole && process.env.NODE_ENV === 'development') {
      console.error('Error handled by useErrorHandler:', {
        originalError: error,
        processedMessage: errorMessage,
        statusCode,
        timestamp: new Date().toISOString(),
      });
    }

    // Show toast notification
    if (showToast) {
      // Different toast types based on status code
      if (statusCode) {
        if (statusCode >= 400 && statusCode < 500) {
          toast.warn(errorMessage);
        } else if (statusCode >= 500) {
          toast.error(errorMessage);
        } else {
          toast.info(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    }

    return {
      message: errorMessage,
      statusCode,
      originalError: error,
    };
  }, []);

  const handleApiError = useCallback((error: any) => {
    // Handle Redux thunk rejectedWithValue
    if (error && typeof error === 'string') {
      return handleError({ message: error }, { showToast: true });
    }

    // Handle axios errors
    if (error?.response) {
      const statusCode = error.response.status;
      const message = error.response.data?.message || 
                    error.response.data?.error || 
                    `HTTP ${statusCode} Error`;
      
      return handleError({ message, statusCode }, { showToast: true });
    }

    // Handle network errors
    if (error?.request) {
      return handleError({ 
        message: 'Network error - please check your connection' 
      }, { showToast: true });
    }

    // Handle GraphQL errors
    if (error?.graphQLErrors?.length > 0) {
      const message = error.graphQLErrors[0].message;
      return handleError({ message }, { showToast: true });
    }

    // Handle other errors
    return handleError(error);
  }, [handleError]);

  const handleValidationError = useCallback((
    validationErrors: Record<string, string>,
    showFirstError = true
  ) => {
    const errorMessages = Object.values(validationErrors);
    
    if (errorMessages.length === 0) return;

    if (showFirstError) {
      toast.error(errorMessages[0]);
    } else {
      errorMessages.forEach(message => toast.error(message));
    }

    return {
      messages: errorMessages,
      count: errorMessages.length,
    };
  }, []);

  const createErrorHandler = useCallback((
    defaultMessage?: string,
    options?: ErrorHandlerOptions
  ) => {
    return (error: unknown) => handleError(error, {
      customMessage: defaultMessage,
      ...options,
    });
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleValidationError,
    createErrorHandler,
  };
};

export default useErrorHandler; 