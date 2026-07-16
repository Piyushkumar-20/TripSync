import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        if (!isMounted) return;
        setStatus("success");
        setMessage(response?.data?.message || "Your email has been verified.");
      } catch (err) {
        if (!isMounted) return;
        setStatus("error");
        setMessage(getAuthErrorMessage(err, "Verification link may have expired. Please request a new one."));
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {status === "success" ? "Email verified" : status === "error" ? "Verification failed" : "Verifying email"}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "success" ? (
              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to login
              </Button>
            ) : (
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate("/login")}>
                  Go to login
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                    Request a new verification email
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}