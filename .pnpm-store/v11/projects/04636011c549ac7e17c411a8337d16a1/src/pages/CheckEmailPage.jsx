import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
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

export default function CheckEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [resendStatus, setResendStatus] = useState("idle");
  const [error, setError] = useState("");

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

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheck className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-balance">
              We sent a verification link{email ? <> to <strong>{email}</strong></> : ""}.
              The link expires in 15 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
              Open the email from TripSync and click the verification link. After
              your email is verified, you can sign in to your dashboard.
            </div>

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

              {error && <p className="text-sm text-destructive">{error}</p>}
              {resendStatus === "sent" && (
                <p className="text-sm text-muted-foreground">
                  A fresh verification link is on its way.
                </p>
              )}

              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={resendStatus === "loading"}
              >
                {resendStatus === "loading" && (
                  <RefreshCw className="mr-2 size-4 animate-spin" aria-hidden="true" />
                )}
                {resendStatus === "loading" ? "Sending..." : "Resend verification email"}
              </Button>
            </form>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button className="w-full" onClick={() => navigate("/login", { state: { email } })}>
                Go to login
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/register">Use another email</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
