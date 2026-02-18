import React, { createContext, ReactNode, useContext } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';

// Create the context with default values
const AdminAuthContext = createContext<any>(null);

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAdminAuth();
  
  return (
    <AdminAuthContext.Provider value={auth}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAdminAuthContext() {
  const context = useContext(AdminAuthContext);
  
  if (context === undefined) {
    throw new Error('useAdminAuthContext must be used within an AuthProvider');
  }
  
  return context;
}