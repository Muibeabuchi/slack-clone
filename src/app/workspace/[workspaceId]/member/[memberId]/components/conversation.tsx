import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Loader } from "lucide-react";
import Header from "./header";
import useGetMemberById from "@/features/members/api/use-get-member-by-id";
import useMemberId from "@/hooks/use-member-id ";
import ChatInput from "./chat-input";
import MessageList from "@/components/message-list";

interface ConversationProps {
  conversationId: Id<"conversations">;
}

export const Conversation = ({ conversationId }: ConversationProps) => {
  const memberId = useMemberId();
  const { data: memberInfo, isLoading: memberInfoLoading } = useGetMemberById({
    memberId,
  });
  const { results, status, loadMore } = useGetMessages({
    conversationId: conversationId,
  });

  //   if (status === "LoadingFirstPage")

  if (status === "LoadingFirstPage" || memberInfoLoading) {
    return (
      <div className="flex flex-col  h-full items-center justify-center">
        <Loader className="animate-spin size-6 text-muted-foreground " />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        onClick={() => {}}
        memberImage={memberInfo?.user?.image}
        memberName={memberInfo?.user.name}
      />
      <MessageList
        data={results}
        memberImage={memberInfo?.user?.image}
        memberName={memberInfo?.user.name}
        variant="conversation"
        isLoadingMore={status === "LoadingMore"}
        loadMore={loadMore}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput
        placeholder={`Message ${memberInfo?.user.name}`}
        conversationId={conversationId}
      />
    </div>
  );
};
