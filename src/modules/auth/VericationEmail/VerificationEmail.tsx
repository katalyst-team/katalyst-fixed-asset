import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useActivateEmailMutation } from "@/hooks/api/auth/activateEmailMutation";
import { useSendOtpEmailMutation } from "@/hooks/api/auth/sendOtpEmailMutation";
import { decryptText } from "@/lib/crypto";
import { cn } from "@/lib/utils";

const VerificationEmail = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const { t } = useTranslation(["auth"]);
  const router = useRouter();
  const { email: encryptedEmail } = router.query;
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");
  const [hasSentOnce, setHasSentOnce] = useState(false);
  const otpSentRef = useRef(false);

  const sendOtpMutation = useSendOtpEmailMutation();
  const activateEmailMutation = useActivateEmailMutation();

  useEffect(() => {
    if (!router.isReady) return;
    if (otpSentRef.current) return;
    if (encryptedEmail && typeof encryptedEmail === "string") {
      otpSentRef.current = true;
      const decryptedEmail = decryptText(encryptedEmail);
      setEmail(decryptedEmail);
      handleSendOtp(decryptedEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, encryptedEmail]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (emailToUse: string) => {
    try {
      await sendOtpMutation.mutateAsync({ email: emailToUse });
      setCountdown(60);
      setHasSentOnce(true);
      toast.success(t("auth:verificationEmail.otpSent"));
    } catch {
      toast.error(t("auth:verificationEmail.otpSendFailed"));
    }
  };

  const handleResendOtp = () => {
    if (countdown > 0 || !hasSentOnce) return;
    handleSendOtp(email);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error(t("auth:verificationEmail.invalidOtp"));
      return;
    }

    try {
      await activateEmailMutation.mutateAsync({
        email,
        otp,
      });
      toast.success(t("auth:verificationEmail.verified"));
      router.push("/");
    } catch {
      toast.error(t("auth:verificationEmail.invalidOtpTryAgain"));
      setOtp("");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-primary">
            {t("auth:verificationEmail.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("auth:verificationEmail.description")}
            {email && (
              <div className="mt-1">
                {t("auth:verificationEmail.sentTo", { email })}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="otp">
                    {t("auth:verificationEmail.otpLabel")}
                  </Label>
                  <Button
                    className={cn(
                      "ml-auto p-0 h-auto",
                      countdown > 0 && "cursor-not-allowed opacity-50"
                    )}
                    disabled={countdown > 0 || sendOtpMutation.isPending || !hasSentOnce}
                    type="button"
                    variant="link"
                    onClick={handleResendOtp}
                  >
                    {countdown > 0
                      ? t("auth:verificationEmail.resendIn", {
                          seconds: countdown,
                        })
                      : sendOtpMutation.isPending
                        ? t("auth:verificationEmail.sending")
                        : t("auth:verificationEmail.sendAgain")}
                  </Button>
                </div>
                <InputOTP
                  className="w-full mx-auto"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup className="w-full justify-center items-center">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex flex-col md:flex-row w-full gap-2">
                <Link className="w-full md:w-1/4" href="/sign-up">
                  <Button className="w-full" variant="outline">
                    {t("auth:verificationEmail.back")}
                  </Button>
                </Link>

                <Button
                  className="w-full transition-all duration-200 md:w-3/4"
                  disabled={activateEmailMutation.isPending || otp.length !== 6}
                  type="submit"
                >
                  {activateEmailMutation.isPending
                    ? t("auth:verificationEmail.verifying")
                    : t("auth:verificationEmail.verify")}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationEmail;
