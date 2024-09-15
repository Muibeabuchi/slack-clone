import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

export default function useChannelId() {
  return useParams().channelId as Id<"channels">;
}
