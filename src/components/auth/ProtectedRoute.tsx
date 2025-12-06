import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUser } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = getUser();
        const token = localStorage.getItem('token');

        console.log('ProtectedRoute check:', { hasToken: !!token, hasUser: !!user, userRole: user?.role, allowedRoles, pathname: location.pathname });

        // Check if user is logged in
        if (!token || !user) {
          console.log('ProtectedRoute: Not authenticated, redirecting to login');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        // Validate user object has required fields
        if (!user.role) {
          console.error('ProtectedRoute: User object missing role field', user);
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        // If no specific roles required, any authenticated user can access
        if (allowedRoles.length === 0) {
          console.log('ProtectedRoute: No role requirement, allowing access');
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }

        // Check if user has required role (case-insensitive comparison for safety)
        const userRole = user.role?.toLowerCase().trim();
        const hasRequiredRole = allowedRoles.some(role => role.toLowerCase().trim() === userRole);
        
        if (hasRequiredRole) {
          console.log('ProtectedRoute: User has required role, allowing access');
          setIsAuthorized(true);
        } else {
          console.log('ProtectedRoute: User role not allowed, redirecting to login', { userRole, allowedRoles });
          setIsAuthorized(false);
        }

        setIsChecking(false);
      } catch (error) {
        console.error('ProtectedRoute: Error during authentication check', error);
        setIsAuthorized(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [allowedRoles, location.pathname]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authorized
  if (!isAuthorized) {
    // Store the attempted location so we can redirect back after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // User is authorized, render the protected content
  return <>{children}</>;
}

