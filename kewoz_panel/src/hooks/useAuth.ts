import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/auth/authStore';
import { queryKeys } from '@/lib/queryClient';
import { LoginCredentials, RegisterData, UserProfile } from '@/types/auth';
import { useToast } from '@/components/ui/use-toast';

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  return useMutation(
    (credentials: LoginCredentials) => authService.login(credentials),
    {
      onSuccess: (data) => {
        // Update auth state
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Invalidate and refetch user data
        queryClient.setQueryData(queryKeys.auth.me, data.user);
        
        // Show success message
        toast({
          title: 'Login successful',
          description: `Welcome back, ${data.user.name}!`,
        });
        
        // Redirect to home or intended URL
        navigate('/dashboard', { replace: true });
      },
      onError: (error: Error) => {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
}

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  return useMutation(
    (userData: RegisterData) => authService.register(userData),
    {
      onSuccess: (data) => {
        // Update auth state
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Invalidate and refetch user data
        queryClient.setQueryData(queryKeys.auth.me, data.user);
        
        // Show success message
        toast({
          title: 'Registration successful',
          description: 'Your account has been created!',
        });
        
        // Redirect to verification or dashboard
        navigate('/verify-email', { replace: true });
      },
      onError: (error: Error) => {
        toast({
          title: 'Registration failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const clearUser = useAuthStore((state) => state.clearUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  return useMutation(() => authService.logout(), {
    onSuccess: () => {
      // Clear auth state
      clearUser();
      setIsAuthenticated(false);
      
      // Remove queries
      queryClient.removeQueries(queryKeys.auth.me);
      
      // Show success message
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      
      // Redirect to login
      navigate('/login', { replace: true });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUser() {
  const { data: user, isLoading, error } = useQuery<UserProfile>(
    queryKeys.auth.me,
    () => authService.getCurrentUser(),
    {
      enabled: authService.isAuthenticated(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401 (Unauthorized)
        if (error?.statusCode === 401) {
          return false;
        }
        return failureCount < 3;
      },
      onError: (error: any) => {
        // Clear invalid auth state on error
        if (error?.statusCode === 401) {
          authService.logout().catch(console.error);
        }
      },
    }
  );

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}

export function useRefreshToken() {
  return useMutation(() => authService.refreshToken(), {
    onSuccess: (tokens) => {
      // Update auth state with new tokens
      // This is handled by the auth interceptor
    },
    onError: (error: Error) => {
      console.error('Failed to refresh token:', error);
      // Logout on refresh token failure
      authService.logout().catch(console.error);
    },
  });
}

export function useForgotPassword() {
  const { toast } = useToast();
  
  return useMutation(
    (email: string) => authService.forgotPassword(email),
    {
      onSuccess: () => {
        toast({
          title: 'Password reset email sent',
          description: 'Please check your email for instructions to reset your password.',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Failed to send reset email',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
}

export function useResetPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  return useMutation(
    ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    {
      onSuccess: () => {
        toast({
          title: 'Password reset successful',
          description: 'You can now log in with your new password.',
        });
        navigate('/login', { replace: true });
      },
      onError: (error: Error) => {
        toast({
          title: 'Password reset failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
}

export function useVerifyEmail() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  return useMutation(
    (token: string) => authService.verifyEmail(token),
    {
      onSuccess: () => {
        toast({
          title: 'Email verified',
          description: 'Your email has been successfully verified!',
        });
        navigate('/dashboard', { replace: true });
      },
      onError: (error: Error) => {
        toast({
          title: 'Email verification failed',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );
}

// Helper hook to check authentication status
export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { user, isLoading, error } = useUser();
  
  return {
    isAuthenticated: isAuthenticated && !!user,
    isLoading,
    user,
    error,
  };
}
