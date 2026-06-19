import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";

import KatalystLogo from "@/components/shared/KatalystLogo";
import { Button } from "@/components/ui/button";
import { useSignInMutation } from "@/hooks/api/auth/signInMutation";
import { persistAuthTokens } from "@/lib/authTokens";
import { cn } from "@/lib/utils";
import { toastError } from "@/services";

const signInSchema = yup.object({
  email: yup
    .string()
    .required("Email or phone number is required")
    .test("is-email-or-phone", "Invalid email or phone number", (value) => {
      if (!value) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[+]?[0-9]{7,15}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
  password: yup.string().required("Password is required"),
});

type SignInFormData = yup.InferType<typeof signInSchema>;

const SignIn = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const signInMutation = useSignInMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    signInMutation
      .mutateAsync({
        email: data.email,
        password: data.password,
      })
      .then((resp) => {
        persistAuthTokens(resp.data.access_token, resp.data.refresh_token);
        queryClient.clear();
        toast.success("Login successful");
        router.push("/dashboard/overview");
      })
      .catch((err) => {
        toastError(err);
      });
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div
        className="rounded-2xl bg-white px-10 py-12"
        style={{
          boxShadow:
            "0 1px 0 0 rgba(37,99,235,.05), 0 24px 60px -20px rgba(37,99,235,.18), 0 4px 16px -4px rgba(15,23,42,.06)",
        }}
      >
        {/* Logo + Heading */}
        <div className="flex flex-col items-center text-center">
          <KatalystLogo size={56} />
          <h1
            className="mt-6 text-3xl font-bold tracking-tight"
            style={{ color: "hsl(var(--text))", letterSpacing: "-0.02em" }}
          >
            {t("auth:login.title", "Welcome back")}
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "hsl(var(--text-2))" }}
          >
            {t(
              "auth:login.description",
              "Sign in to continue to your account",
            )}
          </p>
        </div>

        {/* Form */}
        <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Email field */}
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold"
              htmlFor="email"
              style={{ color: "hsl(var(--text))" }}
            >
              {t("auth:login.emailLabel", "Email or phone")}
            </label>
            <div
              className="relative flex items-center rounded-xl border bg-white transition-all duration-150 focus-within:border-[hsl(var(--brand))] focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,hsl(var(--brand))_14%,transparent)]"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <Mail
                className="ml-4 h-5 w-5 shrink-0"
                style={{ color: "hsl(var(--text-3))" }}
              />
              <input
                className="flex-1 bg-transparent px-3 py-3.5 text-base outline-none placeholder:text-[hsl(var(--text-3))]"
                id="email"
                placeholder={t("auth:login.emailPlaceholder", "you@email.com")}
                type="text"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm" style={{ color: "hsl(var(--destructive))" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                className="block text-sm font-semibold"
                htmlFor="password"
                style={{ color: "hsl(var(--text))" }}
              >
                {t("auth:login.passwordLabel", "Password")}
              </label>
              <Link
                className="text-sm font-medium transition-colors hover:opacity-80"
                href="/reset-password"
                style={{ color: "hsl(var(--brand))" }}
              >
                {t("auth:login.forgotPassword", "Forgot password?")}
              </Link>
            </div>
            <div
              className="relative flex items-center rounded-xl border bg-white transition-all duration-150 focus-within:border-[hsl(var(--brand))] focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,hsl(var(--brand))_14%,transparent)]"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <Lock
                className="ml-4 h-5 w-5 shrink-0"
                style={{ color: "hsl(var(--text-3))" }}
              />
              <input
                className="flex-1 bg-transparent px-3 py-3.5 text-base outline-none placeholder:text-[hsl(var(--text-3))]"
                id="password"
                placeholder="••••••••••••"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button
                className="mr-3 flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[hsl(var(--surface-2))]"
                style={{ color: "hsl(var(--text-3))" }}
                tabIndex={-1}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm" style={{ color: "hsl(var(--destructive))" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Login button */}
          <Button
            className="h-12 w-full rounded-xl text-base font-semibold transition-all duration-200"
            disabled={signInMutation.isPending}
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, hsl(var(--brand)) 92%, white 8%) 0%, hsl(var(--brand)) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.18), 0 4px 12px -2px rgba(37,99,235,.30)",
            }}
            type="submit"
          >
            {signInMutation.isPending
              ? t("auth:login.loggingIn", "Logging in…")
              : t("auth:login.button", "Log in")}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "hsl(var(--border))" }}
            />
            <span className="text-sm" style={{ color: "hsl(var(--text-3))" }}>
              {t("auth:login.or", "or")}
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "hsl(var(--border))" }}
            />
          </div>

          {/* Sign up */}
          <div className="text-center text-sm" style={{ color: "hsl(var(--text-2))" }}>
            {t("auth:login.noAccount", "Don't have an account?")}{" "}
            <Link
              className="font-semibold transition-colors hover:opacity-80"
              href="/sign-up"
              style={{ color: "hsl(var(--brand))" }}
            >
              {t("auth:login.signUp", "Sign up")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
