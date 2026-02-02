import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../appwrite/config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ✅ SINGLE, SAFE logout
  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch {
      // No active session, ignore
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
