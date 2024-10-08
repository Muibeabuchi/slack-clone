import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

export default function useMemberId() {
  return useParams().memberId as Id<"members">;
}
