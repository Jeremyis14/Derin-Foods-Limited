import { AdminGate } from './admin/AdminRole';
import { useUser } from './auth/UserAuth';
import UserDashboard from './user/UserDashboard';
import AdminStats from './AdminStats';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProtectedRoutes() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } 
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (user.role === 'admin') {
    return (
      <AdminGate>
        <AdminStats />
      </AdminGate>
    );
  }

  return <UserDashboard user={user} />;
}