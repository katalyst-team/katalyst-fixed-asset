import { Plus } from "lucide-react";

import { Button, ButtonProps } from "../ui/button";

export type ButtonAddProps = ButtonProps;

const ButtonAdd = ({ ...props }: ButtonAddProps) => {
  return (
    <Button
      size="icon"
      variant="outline"
      {...props}
      className={`bg-success/10 text-success border border-success/30 hover:bg-success/20 transition-all duration-200 ${props.className}`}
    >
      <Plus />
    </Button>
  );
};

export default ButtonAdd;
