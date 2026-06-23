import { AlertCircle } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";

interface FaQueryStateProps {
  children: React.ReactNode;
  emptyDescription?: string;
  emptyTitle?: string;
  isError: boolean;
  isEmpty?: boolean;
  isLoading: boolean;
  skeleton?: React.ReactNode;
}

export function FaQueryState({
  children,
  emptyDescription,
  emptyTitle,
  isError,
  isEmpty,
  isLoading,
  skeleton,
}: FaQueryStateProps) {
  if (isLoading) {
    return <>{skeleton ?? <Loading />}</>;
  }

  if (isError) {
    return (
      <EmptyState
        description="Something went wrong. Please try again."
        icon={<AlertCircle className="h-12 w-12 text-destructive" />}
        title="Failed to load"
      />
    );
  }

  if (isEmpty) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />;
  }

  return <>{children}</>;
}

export function FaQueryError({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
      description="Something went wrong. Please try again."
      icon={<AlertCircle className="h-12 w-12 text-destructive" />}
      title="Failed to load"
    />
  );
}
