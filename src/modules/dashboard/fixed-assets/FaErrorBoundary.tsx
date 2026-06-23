import { AlertTriangle } from "lucide-react";
import { Component, ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface FaErrorBoundaryState {
  error?: Error;
  hasError: boolean;
}

interface FaErrorBoundaryProps {
  children: ReactNode;
}

export class FaErrorBoundary extends Component<
  FaErrorBoundaryProps,
  FaErrorBoundaryState
> {
  constructor(props: FaErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FaErrorBoundaryState {
    return { error, hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="mb-4 max-w-md text-sm text-muted-foreground">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
