import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // router.push('/login'); // Commented out since we're not locking them out
    }
  }, [isAuthenticated, router]);

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;

/* 
// Example protected page
import ProtectedRoute from '../app/components/ProtectedRoute';

const ProtectedPage = () => {
  return (
    <ProtectedRoute>
      <div>Protected Content</div>
    </ProtectedRoute>
  );
};

export default ProtectedPage;
*/
