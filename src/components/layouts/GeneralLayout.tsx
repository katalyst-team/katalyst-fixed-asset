import { ReactNode } from "react";

export interface GeneralLayoutProps {
  children: ReactNode;
}

const GeneralLayout = (props: GeneralLayoutProps) => {
  return (
    <div
      className="flex min-h-svh w-full items-center justify-center p-6 font-sans md:p-10"
      style={{
        background:
          "radial-gradient(75% 60% at 0% 0%, color-mix(in oklab, hsl(var(--brand)) 8%, transparent) 0%, transparent 60%)," +
          "radial-gradient(60% 50% at 100% 100%, color-mix(in oklab, hsl(var(--accent)) 6%, transparent) 0%, transparent 60%)," +
          "linear-gradient(135deg, #eff4ff 0%, #f5f9ff 50%, #eff4ff 100%)",
      }}
    >
      <div className="w-full max-w-md">{props.children}</div>
    </div>
  );
};

export default GeneralLayout;
