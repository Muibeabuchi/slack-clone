import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseGetMessageByIdProps {
  messageId: Id<"messages">;
}

export function UseGetMessageById({ messageId }: UseGetMessageByIdProps) {
  const data = useQuery(api.messages.getById, {
    messageId,
  });

  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}
