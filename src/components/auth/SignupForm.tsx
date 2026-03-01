"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

type SignupFormProps = {
  embedded?: boolean;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
};

export function SignupForm({ embedded, onSuccess, onSwitchToLogin }: SignupFormProps = {}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignupInput) {
    setError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInResult?.error) {
      if (embedded && onSuccess) {
        onSuccess();
        return;
      }
      router.push("/login?message=Account created. Please sign in.");
      router.refresh();
      return;
    }

    try {
      localStorage.setItem("serviceFunnel_userName", data.name);
    } catch {
      // localStorage may be unavailable
    }

    if (embedded && onSuccess) {
      onSuccess();
      return;
    }
    router.push("/");
    router.refresh();
  }

  const switchEl = (
    <p className="text-center text-sm text-muted-foreground">
      Already have an account?{" "}
      {onSwitchToLogin ? (
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-yellow-600 underline-offset-4 hover:underline dark:text-yellow-400"
        >
          Sign in
        </button>
      ) : (
        <Link
          href="/login"
          className="font-medium text-yellow-600 underline-offset-4 hover:underline dark:text-yellow-400"
        >
          Sign in
        </Link>
      )}
    </p>
  );

  const fields = (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-xl border-2 border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            className="pl-10"
            autoComplete="name"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            autoComplete="email"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            className="pl-10"
            autoComplete="new-password"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repeat password"
            className="pl-10"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </div>
  );

  const submitButton = (
    <Button
      type="submit"
      size="lg"
      className="w-full rounded-full bg-yellow-400 font-bold text-black hover:bg-yellow-300 disabled:opacity-50"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <>
          Create account
          <ArrowRight className="size-4" />
        </>
      )}
    </Button>
  );

  if (embedded) {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields}
        <div className="mt-6 flex flex-col gap-4">
          {submitButton}
          {switchEl}
        </div>
      </form>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-md border-2 shadow-lg shadow-primary/5">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>
            Sign up to apply coupons and request quotes for our services.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">{fields}</CardContent>
          <CardFooter className="flex flex-col gap-4">
            {submitButton}
            {switchEl}
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
