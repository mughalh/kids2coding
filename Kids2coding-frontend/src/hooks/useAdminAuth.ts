import { useEffect, useState } from 'react';
import {
    checkIsAdmin,
    getCurrentAdmin,
    onAdminAuthChange,
    signInAdmin,
    signOutAdmin
} from '../services/adminAuthService';

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAdminAuthChange(async (user) => {
      if (user) {
        setAdmin({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
        const adminCheck = await checkIsAdmin();
        setIsAdmin(adminCheck);
      } else {
        setAdmin(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return await signInAdmin(email, password);
  };

  const logout = async () => {
    const result = await signOutAdmin();
    if (result.success) {
      setAdmin(null);
      setIsAdmin(false);
    }
    return result;
  };

  return {
    admin,
    loading,
    isAdmin,
    signInAdmin: login,
    logoutAdmin: logout,
    getCurrentAdmin
  };
}