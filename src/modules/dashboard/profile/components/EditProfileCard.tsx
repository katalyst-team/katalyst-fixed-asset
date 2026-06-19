"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, PenBox } from "lucide-react";
import { useTranslation } from "next-i18next";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/user-context";
import { useUpdateProfileMutation } from "@/hooks/api/auth/useUpdateProfileMutation";

const editProfileSchema = z.object({
  first_name: z.string().min(1, "required"),
  last_name: z.string().min(1, "required"),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

const EditProfileCard = () => {
  const { t } = useTranslation("profile");
  const { isPending, mutate } = useUpdateProfileMutation();
  const queryClient = useQueryClient();
  const { tokenPayload } = useUser();

  const form = useForm<EditProfileValues>({
    defaultValues: {
      first_name: tokenPayload?.first_name ?? "",
      last_name: tokenPayload?.last_name ?? "",
    },
    resolver: zodResolver(editProfileSchema),
  });

  const handleSubmit = (values: EditProfileValues) => {
    mutate(values, {
      onError: () => {
        toast.error(t("editProfile.error"));
      },
      onSuccess: () => {
        toast.success(t("editProfile.success"));
        queryClient.invalidateQueries({ queryKey: ["user"] });
      },
    });
  };

  const getErrorMessage = (msg?: string) => {
    if (!msg) return undefined;
    const key = `editProfile.validation.${msg}`;
    const translated = t(key);
    return translated !== key ? translated : msg;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PenBox className="h-5 w-5 text-primary" />
          <CardTitle>{t("editProfile.title")}</CardTitle>
        </div>
        <CardDescription>{t("editProfile.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("editProfile.firstName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("editProfile.firstNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage>
                    {getErrorMessage(form.formState.errors.first_name?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("editProfile.lastName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("editProfile.lastNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage>
                    {getErrorMessage(form.formState.errors.last_name?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button disabled={isPending} type="submit">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? t("editProfile.saving") : t("editProfile.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditProfileCard;
