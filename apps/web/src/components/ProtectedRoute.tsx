import React from 'react';
import { useAuthStore } from './features/auth/store';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = useAuthStore();

  if (!token) {
    return null;
  }

  return <>{children}</>;
};
