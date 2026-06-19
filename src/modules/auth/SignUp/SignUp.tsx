import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/router";
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
import { useSignUpMutation } from "@/hooks/api/auth/signUpMutation";
import { encryptText } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import { toastError } from "@/services";

const signUpSchema = yup.object({
  company_name: yup.string().required("Company name is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  email: yup.string().email("Invalid email").required("Email is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  phone: yup.string().required("Phone number is required"),
});

type SignUpFormData = yup.InferType<typeof signUpSchema>;

const SignUp = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const signUpMutation = useSignUpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    signUpMutation
      .mutateAsync({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        organization_name: data.company_name,
        password: data.password,
        phone: data.phone,
      })
      .then(() => {
        const encryptedEmail = encryptText(data.email);
        router.push(`/sign-up/${encryptedEmail}`);
      })
      .catch((err) => {
        toastError(err);
      });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">{t("auth:signUp.title")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("auth:signUp.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <InputWithLabel
                isRequired
                id="first_name"
                label={t("auth:signUp.firstNameLabel")}
                placeholder={t("auth:signUp.firstNamePlaceholder")}
                {...register("first_name")}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <InputWithLabel
                isRequired
                id="last_name"
                label={t("auth:signUp.lastNameLabel")}
                placeholder={t("auth:signUp.lastNamePlaceholder")}
                {...register("last_name")}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <InputWithLabel
                isRequired
                id="email"
                label={t("auth:signUp.emailLabel")}
                placeholder={t("auth:signUp.emailPlaceholder")}
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <InputWithLabel
                isRequired
                id="company_name"
                label={t("auth:signUp.companyNameLabel")}
                placeholder={t("auth:signUp.companyNamePlaceholder")}
                {...register("company_name")}
              />
              {errors.company_name && (
                <p className="text-sm text-red-500">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <InputWithLabel
                isRequired
                id="phone"
                label={t("auth:signUp.phoneLabel")}
                placeholder={t("auth:signUp.phonePlaceholder")}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <InputWithLabel
                isPassword
                isRequired
                id="password"
                label={t("auth:signUp.passwordLabel")}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <InputWithLabel
                isPassword
                isRequired
                id="confirm_password"
                label={t("auth:signUp.confirmPasswordLabel")}
                {...register("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="text-sm text-red-500">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <Button
              className="w-full transition-all duration-200"
              disabled={signUpMutation.isPending}
              type="submit"
            >
              {signUpMutation.isPending
                ? t("auth:signUp.creating")
                : t("auth:signUp.button")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("auth:signUp.alreadyAccount")}{" "}
              <Link className="underline underline-offset-4" href="/">
                {t("auth:signUp.signIn")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
