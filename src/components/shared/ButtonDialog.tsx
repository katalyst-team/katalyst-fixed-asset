import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button, ButtonProps } from "../ui/button";
export interface ButtonDialogProps extends ButtonProps {
  title: string;
  description: string;
  text_btn_continue: string;
  text_btn_cancel: string;
  icon: React.ReactNode;
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ButtonDialog = (props: ButtonDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          {...props}
          className={`border ${props.className}`}
        >
          {props.icon}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>{props.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{props.text_btn_cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              props.onSubmit(e);
            }}
          >
            {props.text_btn_continue}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ButtonDialog;
