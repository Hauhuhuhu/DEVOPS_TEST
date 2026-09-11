import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import Spinner from '../../ui/Spinner';

function ProtectedRoute() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token hợp lệ, cho phép render các component con bên trong
  return <Outlet />;
}

export default ProtectedRoute;
