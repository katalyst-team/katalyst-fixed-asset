import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResetPasswordMutation } from "@/hooks/api/auth/resetPasswordMutation";
import { encryptText } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import { toastError } from "@/services";

const resetPasswordSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

const ResetPassword = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const resetPasswordMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    resetPasswordMutation
      .mutateAsync({
        email: data.email,
      })
      .then(() => {
        const encryptedEmail = encryptText(data.email);
        router.push(`/reset-password-confirmation/${encryptedEmail}`);
      })
      .catch((err) => {
        toastError(err);
      });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">
            {t("auth:resetPassword.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("auth:resetPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <InputWithLabel
                  isRequired
                  id="email"
                  label={t("auth:resetPassword.emailLabel")}
                  placeholder={t("auth:resetPassword.emailPlaceholder")}
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="flex flex-col md:flex-row w-full gap-2">
                <Link className="w-full md:w-1/4" href={"/"}>
                  <Button className="w-full" variant={"outline"}>
                    {t("auth:resetPassword.back")}
                  </Button>
                </Link>

                <Button
                  className="w-full transition-all duration-200 md:w-3/4"
                  disabled={resetPasswordMutation.isPending}
                  type="submit"
                >
                  {resetPasswordMutation.isPending
                    ? t("auth:resetPassword.resetting")
                    : t("auth:resetPassword.button")}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
