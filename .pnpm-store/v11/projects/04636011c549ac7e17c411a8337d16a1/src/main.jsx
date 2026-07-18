import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { createQueryClient } from "@/lib/queryClient";
import "./index.css";
import App from "./App.jsx";

const queryClient = createQueryClient();
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const maybeWithGoogleProvider = (children) =>
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
  ) : (
    children
  );

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        {maybeWithGoogleProvider(
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>
                <SocketProvider>
                  <App />
                  <Toaster richColors position="top-right" />
                  <SpeedInsights />
                </SocketProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        )}
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
