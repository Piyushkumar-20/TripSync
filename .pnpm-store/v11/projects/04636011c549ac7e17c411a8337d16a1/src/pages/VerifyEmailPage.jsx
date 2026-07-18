import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getAuthErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const stateCopy = {
  loading: {
    title: "Verifying email",
    description: "Give us a moment while we confirm your email address.",
    icon: Loader2,
    iconClassName: "animate-spin text-primary",
    containerClassName: "bg-primary/10",
  },
  success: {
    title: "Email verified",
    description: "Your email is verified. You can now log in and continue planning.",
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    containerClassName: "bg-emerald-500/10",
  },
  error: {
    title: "Link expired or invalid",
    description: "This verification link is no longer valid. Request a fresh link below.",
    icon: AlertCircle,
    iconClassName: "text-destructive",
    containerClassName: "bg-destructive/10",
  },
};

export default function VerifyEmailPage() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();
  const [status, setStatus] = useState("loading");
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [error, setError] = useState("");
  const [resendStatus, setResendStatus] = useState("idle");

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      setStatus("loading");
      setError("");

      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        if (!isMounted) return;

        setStatus("success");
        const verifiedEmail = response?.data?.data?.email;
        if (verifiedEmail) setEmail(verifiedEmail);
        toast.success("Email verified successfully");
      } catch (err) {
        if (!isMounted) return;

        setStatus("error");
        setError(
          getAuthErrorMessage(
            err,
            "This verification link is invalid or has expired.",
          ),
        );
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setError("");
    setResendStatus("loading");

    try {
      await resendVerificationEmail(email.trim());
      setResendStatus("sent");
      toast.success("Verification email sent");
    } catch (err) {
      const message = getAuthErrorMessage(
        err,
        "We could not resend the verification email. Please try again.",
      );
      setError(message);
      toast.error(message);
      setResendStatus("error");
    }
  };

  const copy = stateCopy[status];
  const Icon = copy.icon;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="items-center text-center">
            <div className={`mb-2 flex size-12 items-center justify-center rounded-full ${copy.containerClassName}`}>
              <Icon className={`size-6 ${copy.iconClassName}`} aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">{copy.title}</CardTitle>
            <CardDescription className="text-balance">
              {status === "error" && error ? error : copy.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {status === "loading" && (
              <div className="rounded-md border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                Please keep this page open while we verify your account.
              </div>
            )}

            {status === "success" && (
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => navigate("/login", { state: { email } })}
                >
                  Go to login
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Use the password you created during signup.
                </p>
              </div>
            )}

            {status === "error" && (
              <form onSubmit={handleResend} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="verification-email">Email address</Label>
                  <Input
                    id="verification-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {resendStatus === "sent" && (
                  <p className="text-sm text-muted-foreground">
                    A new verification link has been sent. Please check your inbox.
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={resendStatus === "loading"}
                >
                  {resendStatus === "loading" && (
                    <RefreshCw className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  )}
                  {resendStatus === "loading" ? "Sending..." : "Resend verification email"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                    Back to login
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
