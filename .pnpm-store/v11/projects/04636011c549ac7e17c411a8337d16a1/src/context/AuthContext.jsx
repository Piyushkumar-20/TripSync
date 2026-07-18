import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/authToken";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        let token = getAccessToken();

        if (!token) {
          const refreshResponse = await api.post("/auth/refresh-token");
          token = refreshResponse?.data?.data?.accessToken;
          if (token) {
            setAccessToken(token);
          }
        }

        if (!token) {
          setUser(null);
          return;
        }

        const meResponse = await api.get("/auth/me");
        setUser(meResponse.data.data);
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const register = async ({ fullName, email, password }) => {
    const res = await api.post("/auth/register", { fullName, email, password });
    return res.data;
  };

  const resendVerificationEmail = async (email) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  };

  const login = async ({ email, password }) => {
    const res = await api.post("/auth/login", { email, password });
    const loggedInUser = res?.data?.data?.user;
    const accessToken = res?.data?.data?.accessToken;
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const googleLogin = async({ idToken, accessToken: googleAccessToken }) => {
    const res = await api.post("/auth/google", {
      idToken,
      accessToken: googleAccessToken,
    })
    const { accessToken, user } = res.data.data;
    setAccessToken(accessToken)
    setUser(user)

    return user
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        googleLogin,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
