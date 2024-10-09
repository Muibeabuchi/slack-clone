"use client";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import useMemberId from "@/hooks/use-member-id ";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangleIcon, Loader } from "lucide-react";
import { useEffect } from "react";
import { Conversation } from "./components/conversation";
import { toast } from "sonner";

// interface MemberIdPageProps {}

const MemberIdPage = () => {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();

  const {
    mutate,
    isPending,
    data: conversationId,
  } = useCreateOrGetConversation();

  //   console.log(data);

  useEffect(
    function () {
      mutate(
        {
          workspaceId,
          memberId,
        },
        {
          onError() {
            toast.error("Failed to create conversation");
          },
        }
      );
    },
    [workspaceId, memberId, mutate]
  );

  if (isPending) {
    return (
      <div className="flex flex-col  h-full items-center justify-center">
        <Loader className="animate-spin size-6 text-muted-foreground " />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex flex-col gap-y-2 h-full items-center justify-center">
        <AlertTriangleIcon className="size-6  text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    );
  }
  return <Conversation conversationId={conversationId} />;
};

export default MemberIdPage;
