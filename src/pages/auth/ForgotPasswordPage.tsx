import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/api/password.api";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset({ email });
      toast.success("Password reset code sent to your email!");
      navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || "Failed to send password reset code";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/auth/signin")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Forgot Password?</h1>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a code to reset your password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg border border-border">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>

          {/* Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-xs text-muted-foreground">
              • The code will be sent to your email address
            </p>
            <p className="text-xs text-muted-foreground">
              • The code expires in 10 minutes
            </p>
            <p className="text-xs text-muted-foreground">
              • Check your spam folder if you don't see the email
            </p>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Remember your password? </span>
          <button
            onClick={() => navigate("/auth/signin")}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
