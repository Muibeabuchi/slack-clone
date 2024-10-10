import { useProfileMemberId } from "@/features/members/store/use-profile-memember-id";
import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId();
  const [profileMemberId, setProfileMemberId] = useProfileMemberId();

  const onOpenProfileMember = (profileMemberId: string) => {
    setProfileMemberId(profileMemberId);
    setParentMessageId(null);
  };
  const onOpenMessage = (messageId: string) => {
    setParentMessageId(messageId);
    setProfileMemberId(null);
  };
  const onClose = () => {
    setParentMessageId(null);
    setProfileMemberId(null);
  };

  return {
    onOpenMessage,
    onClose,
    parentMessageId,
    onOpenProfileMember,
    profileMemberId,
  };
};
