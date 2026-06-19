import { yupResolver } from "@hookform/resolvers/yup";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/hooks/api/auth/resetPasswordMutation";
import { useResetPasswordOTPMutation } from "@/hooks/api/auth/resetPasswordOTPMutation";
import { decryptText } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import { toastError } from "@/services";

const resetPasswordOTPSchema = yup.object({
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  otp: yup
    .string()
    .length(6, "OTP must be 6 characters")
    .required("OTP is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

type ResetPasswordOTPFormData = yup.InferType<typeof resetPasswordOTPSchema>;

const ResetPasswordOTP = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const params = useParams();
  const resetPasswordOTPMutation = useResetPasswordOTPMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordOTPFormData>({
    resolver: yupResolver(resetPasswordOTPSchema),
  });

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    const email = decryptText(params.email as string);
    resetPasswordMutation
      .mutateAsync({
        email,
      })
      .then(() => {
        setResendTimer(60); // Set 1 minute timer
      })
      .catch((err) => {
        toastError(err);
      });
  };

  const onSubmit = async (data: ResetPasswordOTPFormData) => {
    const email = decryptText(params.email as string);

    resetPasswordOTPMutation
      .mutateAsync({
        email,
        new_password: data.password,
        otp: data.otp,
      })
      .then(() => {
        router.push("/");
      })
      .catch((err) => {
        toastError(err);
      });
  };

  const handleOTPChange = (value: string) => {
    setValue("otp", value, { shouldValidate: true });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">
            {t("auth:resetPasswordOTP.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("auth:resetPasswordOTP.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="otp">
                    {t("auth:resetPasswordOTP.otpLabel")}
                  </Label>
                  <button
                    className={cn(
                      "ml-auto text-sm underline underline-offset-4",
                      resendTimer > 0
                        ? "cursor-not-allowed text-muted-foreground"
                        : "hover:text-primary"
                    )}
                    disabled={
                      resendTimer > 0 || resetPasswordMutation.isPending
                    }
                    type="button"
                    onClick={handleResendOTP}
                  >
                    {resetPasswordMutation.isPending
                      ? t("auth:resetPasswordOTP.sending")
                      : resendTimer > 0
                        ? t("auth:resetPasswordOTP.resendIn", {
                            seconds: resendTimer,
                          })
                        : t("auth:resetPasswordOTP.sendAgain")}
                  </button>
                </div>
                <InputOTP
                  className="w-full flex justify-center items-center"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  onChange={handleOTPChange}
                >
                  <InputOTPGroup className="w-full flex justify-center items-center">
                    <InputOTPSlot className="w-[16.6%]" index={0} />
                    <InputOTPSlot className="w-[16.6%]" index={1} />
                    <InputOTPSlot className="w-[16.6%]" index={2} />
                    <InputOTPSlot className="w-[16.6%]" index={3} />
                    <InputOTPSlot className="w-[16.6%]" index={4} />
                    <InputOTPSlot className="w-[16.6%]" index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {errors.otp && (
                  <p className="text-sm text-red-500">{errors.otp.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">
                  {t("auth:resetPasswordOTP.newPasswordLabel")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">
                  {t("auth:resetPasswordOTP.confirmPasswordLabel")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col md:flex-row w-full gap-2">
                <Link className="w-full md:w-1/4" href={"/"}>
                  <Button className="w-full" variant={"outline"}>
                    {t("auth:resetPasswordOTP.back")}
                  </Button>
                </Link>

                <Button
                  className="w-full transition-all duration-200 md:w-3/4"
                  disabled={resetPasswordOTPMutation.isPending}
                  type="submit"
                >
                  {resetPasswordOTPMutation.isPending
                    ? t("auth:resetPasswordOTP.resetting")
                    : t("auth:resetPasswordOTP.button")}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordOTP;
