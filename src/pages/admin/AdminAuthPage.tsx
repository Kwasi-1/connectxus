import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { Icon } from "@iconify/react/dist/iconify.js";
import { signInWithGoogle } from "@/lib/firebase";

export function AdminAuthPage() {
  const { signIn, googleSignIn, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signIn(email, password);
      toast({
        title: "Welcome!",
        description: "Successfully signed in to Admin Portal.",
      });
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      await googleSignIn(idToken);

      toast({
        title: "Welcome!",
        description: "Successfully signed in to Admin Portal with Google.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage === "Sign-in cancelled") {
        toast({
          title: "Cancelled",
          description: "Google sign-in was cancelled.",
        });
      } else {
        toast({
          title: "Authentication Failed",
          description:
            errorMessage || "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center mb-4">
            <Logo className="h-12 w-auto mr-3" />
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground custom-font">
                  Connect
                </h1>
                <p className="text-sm text-muted-foreground">Admin Portal</p>
              </div>
            </div>
          </div>
          <p className="text-center text-muted-foreground">
            Secure access for university administrators
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  OR
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-lg border-input hover:bg-accent/50 transition-colors"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              <Icon icon="devicon:google" className="w-5 h-5 mr-2" />
              {isGoogleLoading
                ? "Signing in with Google..."
                : "Continue with Google"}
            </Button>

            {/* <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Demo Credentials:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Admin:</strong> admin@university.edu / admin123</p>
                <p><strong>Super Admin:</strong> super@university.edu / super123</p>
              </div>
            </div> */}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>© 2024 Connect University Platform. All rights reserved.</p>
          <p className="mt-1">For support, contact IT administration.</p>
        </div>
      </div>
    </div>
  );
}
