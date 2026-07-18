import { QueryClient } from "@tanstack/react-query";
import { logError } from "@/lib/errors";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        retry: 1,
      },
      mutations: {
        onError: (error) => logError(error, "mutation"),
      },
    },
  });
}
