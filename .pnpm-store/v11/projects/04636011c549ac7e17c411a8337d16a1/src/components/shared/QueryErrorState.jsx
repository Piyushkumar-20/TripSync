import { AlertTriangle, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getLoadErrorMessage } from "@/lib/errors";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function QueryErrorState({
  error,
  title = "Unable to load data",
  queryKey,
  onRetry,
  className,
}) {
  const qc = useQueryClient();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }

    if (queryKey) {
      qc.invalidateQueries({ queryKey });
    }
  };

  return (
    <EmptyState
      className={className}
      icon={AlertTriangle}
      title={title}
      description={getLoadErrorMessage(error)}
      action={
        <Button variant="outline" onClick={handleRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      }
    />
  );
}
