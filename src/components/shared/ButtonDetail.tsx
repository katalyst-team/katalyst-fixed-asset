import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import { Button, ButtonProps } from "../ui/button";

export type ButtonDetailProps = ButtonProps & {
  additionalQuery?: Record<string, string | string[] | undefined>;
  href: string;
};

const ButtonDetail = ({ additionalQuery, href, ...props }: ButtonDetailProps) => {
  const router = useRouter();
  return (
    <Link href={{ pathname: href, query: { ...router.query, ...additionalQuery } }}>
      <Button
        size="icon"
        variant="outline"
        {...props}
        className={`border border-blue-400 ${props.className}`}
      >
        <Eye className="text-blue-400" />
      </Button>
    </Link>
  );
};

export default ButtonDetail;
