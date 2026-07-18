import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem("accessToken"));

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    api.get("/auth/me")
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem("accessToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
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
    const { user: loggedInUser, accessToken } = res.data.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  const googleLogin = async({ idToken, accessToken: googleAccessToken }) => {
    const res = await api.post("/auth/google", {
      idToken,
      accessToken: googleAccessToken,
    })
    const { accessToken, user } = res.data.data;
    localStorage.setItem("accessToken", accessToken)
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
