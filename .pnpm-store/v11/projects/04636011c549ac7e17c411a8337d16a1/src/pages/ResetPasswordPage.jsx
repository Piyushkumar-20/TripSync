import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ password: "", confirm: "" });
  const [status,  setStatus]  = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      await api.put(`/auth/reset-password/${token}`, { password: form.password });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setMessage(getAuthErrorMessage(err, "Link may have expired. Please request a new one."));
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Password reset!</CardTitle>
              <CardDescription>
                Your password has been updated successfully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Set new password</CardTitle>
            <CardDescription>
              Choose a strong password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 8 chars, one uppercase, one digit"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  placeholder="Repeat your new password"
                  required
                  value={form.confirm}
                  onChange={handleChange}
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-destructive">{message}</p>
              )}

              <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? "Resetting..." : "Reset password"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link to="/forgot-password" className="underline underline-offset-4 hover:text-primary">
                  Request a new link
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
