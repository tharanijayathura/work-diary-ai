"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function getApiBaseUrl() {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
  return apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;
}

async function submitLogin(email: string, password: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json().catch(() => ({}))) as { message?: string; user?: { id: string; email: string; name?: string | null } };

  if (!response.ok) {
    throw new Error(payload.message || "Unable to sign in. Check your credentials and try again.");
  }

  return payload;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("john.doe@example.com");
  const [password, setPassword] = useState("Demo1234!");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await submitLogin(email, password);
      if (result.user) {
        window.localStorage.setItem("workdiary-current-user", JSON.stringify(result.user));
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
      setIsSubmitting(false);
    }
  };

  

  return (
    <Card className="w-full max-w-md relative backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>Enter your email to sign in to your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <span className="text-xs text-muted-foreground">Demo: john.doe@example.com / Demo1234!</span>
            </div>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {message ? <p className="text-sm text-red-600 dark:text-red-400">{message}</p> : null}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </CardContent>
      </form>
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background/50 px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" type="button">
          Github
        </Button>
        <div className="text-sm text-center text-muted-foreground mt-4">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
