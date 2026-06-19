"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useChangePasswordMutation } from "@/hooks/api/auth/useChangePasswordMutation";
import useLogout from "@/hooks/api/auth/useLogout";

const changePasswordSchema = z
  .object({
    confirm_new_password: z.string().min(1, "required"),
    current_password: z.string().min(1, "required"),
    new_password: z.string().min(8, "minLength"),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "passwordMismatch",
    path: ["confirm_new_password"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const PasswordInput = ({
  field,
  placeholder,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  placeholder?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...field}
        className="pr-9"
        placeholder={placeholder}
        type={show ? "text" : "password"}
      />
      <button
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        type="button"
        onClick={() => setShow((v) => !v)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

const ChangePasswordCard = () => {
  const { t } = useTranslation("profile");
  const { isPending, mutate } = useChangePasswordMutation();
  const logout = useLogout();

  const form = useForm<ChangePasswordValues>({
    defaultValues: {
      confirm_new_password: "",
      current_password: "",
      new_password: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const handleSubmit = (values: ChangePasswordValues) => {
    mutate(values, {
      onError: () => {
        toast.error(t("changePassword.error"));
      },
      onSuccess: () => {
        toast.success(t("changePassword.success"));
        logout();
      },
    });
  };

  const getErrorMessage = (msg?: string) => {
    if (!msg) return undefined;
    const key = `changePassword.validation.${msg}`;
    const translated = t(key);
    return translated !== key ? translated : msg;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle>{t("changePassword.title")}</CardTitle>
        </div>
        <CardDescription>{t("changePassword.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("changePassword.currentPassword")}</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} placeholder="••••••••" />
                  </FormControl>
                  <FormMessage>
                    {getErrorMessage(form.formState.errors.current_password?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("changePassword.newPassword")}</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} placeholder="••••••••" />
                  </FormControl>
                  <FormDescription>{t("changePassword.newPasswordHint")}</FormDescription>
                  <FormMessage>
                    {getErrorMessage(form.formState.errors.new_password?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("changePassword.confirmPassword")}</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} placeholder="••••••••" />
                  </FormControl>
                  <FormMessage>
                    {getErrorMessage(form.formState.errors.confirm_new_password?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              {t("changePassword.logoutWarning")}
            </div>

            <div className="flex justify-end">
              <Button disabled={isPending} type="submit">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? t("changePassword.saving") : t("changePassword.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordCard;
