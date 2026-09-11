import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import RouteLoading from '../../ui/RouteLoading';

function ProtectedRoute() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <RouteLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token hợp lệ, cho phép render các component con bên trong
  return <Outlet />;
}

export default ProtectedRoute;
