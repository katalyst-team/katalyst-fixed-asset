import { Pencil } from "lucide-react";

import { Button, ButtonProps } from "../ui/button";

export type ButtonEditProps = ButtonProps;

const ButtonEdit = ({ ...props }: ButtonEditProps) => {
  return (
    <Button
      size="icon"
      variant="outline"
      {...props}
      className={`bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 transition-all duration-200 ${props.className}`}
    >
      <Pencil />
    </Button>
  );
};

export default ButtonEdit;
