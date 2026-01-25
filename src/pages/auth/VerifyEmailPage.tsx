import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { sendOTP, verifyOTP, resendOTP } from "@/api/verification.api";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [searchParams] = useSearchParams();
  const emailFromParams = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromParams);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await sendOTP({ email });
      toast.success("Verification code sent to your email!");
      setCountdown(60);
      setOtpSent(true);
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || "Failed to send verification code";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!email || !otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOTP({ email, otp_code: otp });

      if (response.user) {
        setAuthUser(response.user, true);
        toast.success("Welcome! Your email has been verified.");
        navigate("/feed");
      } else {
        toast.success("Email verified successfully!");
        navigate("/auth/signin");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || "Invalid verification code";
      toast.error(message);
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResending(true);
    try {
      await resendOTP({ email });
      toast.success("New verification code sent!");
      setCountdown(60);
      setOtp("");
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message || "Failed to resend code";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/auth/signin")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Verify Your Email</h1>
          <p className="text-muted-foreground">
            {email ? (
              <>
                Enter the 6-digit code sent to <br />
                <span className="font-medium text-foreground">{email}</span>
              </>
            ) : (
              "Enter your email to receive a verification code"
            )}
          </p>
        </div>

        <div className="space-y-6 bg-card p-8 rounded-lg border border-border">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <div className="relative">
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                disabled={!!emailFromParams || otpSent}
              />
              {emailFromParams && otpSent && (
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {!otpSent && (
            <Button
              onClick={handleSendOTP}
              disabled={isLoading || !email}
              className="w-full h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          )}

          {otpSent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Verification Code
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                {countdown > 0 ? (
                  <p className="text-sm font-medium text-foreground">
                    Resend in {countdown}s
                  </p>
                ) : (
                  <Button
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="h-auto p-0 font-semibold"
                  >
                    {isResending ? "Sending..." : "Resend Code"}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-xs text-muted-foreground">
              • Check your spam folder if you don't see the email
            </p>
            <p className="text-xs text-muted-foreground">
              • The code expires in 10 minutes
            </p>
            <p className="text-xs text-muted-foreground">
              • You have 5 attempts to enter the correct code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
