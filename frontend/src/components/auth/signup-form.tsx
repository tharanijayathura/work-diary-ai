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

async function submitSignup(name: string, email: string, password: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const payload = (await response.json().catch(() => ({}))) as { message?: string; user?: { id: string; email: string; name?: string | null } };

  if (!response.ok) {
    throw new Error(payload.message || "Unable to create account.");
  }

  return payload;
}

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("Jordan Lee");
  const [email, setEmail] = useState("jordan@workdiary.dev");
  const [password, setPassword] = useState("Intern123!");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await submitSignup(name, email, password);
      if (result.user) {
        window.localStorage.setItem("workdiary-current-user", JSON.stringify(result.user));
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create account.");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription>Enter your details below to create your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {message ? <p className="text-sm text-red-600 dark:text-red-400">{message}</p> : null}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
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
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
