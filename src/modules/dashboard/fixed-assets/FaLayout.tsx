import { FaErrorBoundary } from "@/modules/dashboard/fixed-assets/FaErrorBoundary";
import { FaModalProvider, FaModalRoot } from "@/modules/dashboard/fixed-assets/modals";

export function FaLayout({ children }: { children: React.ReactNode }) {
  return (
    <FaErrorBoundary>
      <FaModalProvider>
        {children}
        <FaModalRoot />
      </FaModalProvider>
    </FaErrorBoundary>
  );
}
