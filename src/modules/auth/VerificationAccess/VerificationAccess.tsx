import Link from "next/link";
import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const VerificationAccess = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const { t } = useTranslation(["auth"]);
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-center text-2xl text-primary">
            {t("auth:verificationAccess.title")}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {t("auth:verificationAccess.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={
              "mailto:ryan@katalyst.id?subject=Verify%20My%20Katalyst%20Account%20Access&body=Hi%20Ryan%2C%0A%0AI'd%20like%20to%20request%20access%20to%20the%20Katalyst%20platform.%20%0A%0AHere%20are%20my%20details%3A%0A-%20Name%3A%20%0A-%20Company%3A%20%0A-%20Role%3A%20%0A%0AThank%20you%20for%20your%20assistance."
            }
            target="_blank"
          >
            <Button className="w-full transition-all duration-200">
              {t("auth:verificationAccess.button")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
export default VerificationAccess;
