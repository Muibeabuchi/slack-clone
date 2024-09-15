import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseGetChannelByIdProps {
  channelId: Id<"channels">;
}

export function UseGetChannelById({ channelId }: UseGetChannelByIdProps) {
  const data = useQuery(api.channels.getById, {
    channelId,
  });

  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
}
