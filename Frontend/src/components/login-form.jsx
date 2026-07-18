import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage } from "@/lib/errors";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleLoginButton({ disabled, onStart, onSuccess, onError }) {
  const startGoogleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: (tokenResponse) => onSuccess(tokenResponse.access_token),
    onError,
  });

  return (
    <Button
      variant="outline"
      type="button"
      disabled={disabled}
      onClick={() => {
        onStart();
        startGoogleLogin();
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          fill="currentColor"
        />
      </svg>
      Login with Google
    </Button>
  );
}

export function LoginForm({ className, initialEmail = "", ...props }) {
  const { login, googleLogin, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: initialEmail, password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCanResendVerification(false);
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate("/dashboard");
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      setCanResendVerification(/verify your email/i.test(message));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      const response = await resendVerificationEmail(form.email);
      setSuccess(response?.message || "Verification email sent.");
      setCanResendVerification(false);
    } catch (err) {
      setError(getAuthErrorMessage(err, "Unable to resend verification email."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleAccessToken = async (accessToken) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!accessToken) {
        throw new Error("Google did not return an access token.");
      }

      await googleLogin({ accessToken });
      navigate("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err, "Google login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Github or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button variant="outline" className="w-full" type="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="mr-2 h-4 w-4 fill-current"
                  >
                    <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.096 3.292 9.422 7.863 10.947.575.106.787-.25.787-.556 0-.275-.012-1.188-.018-2.156-3.2.694-3.877-1.356-3.877-1.356-.525-1.337-1.281-1.694-1.281-1.694-1.05-.719.08-.706.08-.706 1.162.081 1.774 1.194 1.774 1.194 1.031 1.768 2.705 1.257 3.365.962.106-.747.406-1.256.738-1.544-2.554-.29-5.238-1.277-5.238-5.684 0-1.256.45-2.281 1.188-3.086-.119-.291-.513-1.462.112-3.05 0 0 .969-.31 3.175 1.18a10.96 10.96 0 0 1 5.781 0c2.206-1.49 3.173-1.18 3.173-1.18.627 1.588.233 2.759.114 3.05.74.805 1.187 1.83 1.187 3.086 0 4.418-2.688 5.39-5.249 5.675.418.362.79 1.075.79 2.168 0 1.568-.014 2.831-.014 3.218 0 .309.208.668.793.555C20.21 21.418 23.5 17.094 23.5 12 23.5 5.648 18.352.5 12 .5Z" />
                  </svg>
                  Login with GitHub
                </Button>
                {googleClientId ? (
                  <GoogleLoginButton
                    disabled={loading}
                    onStart={() => {
                      setError("");
                      setSuccess("");
                    }}
                    onSuccess={handleGoogleAccessToken}
                    onError={() => setError("Google login failed. Please try again.")}
                  />
                ) : (
                  <>
                    <Button variant="outline" type="button" disabled>
                      Login with Google
                    </Button>
                    <FieldDescription>
                      Google login is not configured for this deployment.
                    </FieldDescription>
                  </>
                )}
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </Field>
              {error && <FieldError>{error}</FieldError>}
              {success && <FieldDescription>{success}</FieldDescription>}
              {canResendVerification && (
                <Field>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={resendLoading || !form.email}
                    onClick={handleResendVerification}
                  >
                    {resendLoading ? "Sending verification email..." : "Resend verification email"}
                  </Button>
                  <FieldDescription className="text-center">
                    We will send a new verification link to the email you entered.
                  </FieldDescription>
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/register">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
