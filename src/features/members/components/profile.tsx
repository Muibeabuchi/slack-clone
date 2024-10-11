import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronDownIcon,
  Loader,
  MailIcon,
  XIcon,
} from "lucide-react";

import { Id } from "../../../../convex/_generated/dataModel";

import useGetMemberById from "../api/use-get-member-by-id";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";

import { useRemoveMember } from "../api/use-remove-member";
import { useUpdateMemberRole } from "../api/use-update-member-role";
import useCurrentMember from "../api/use-current-member";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

interface ProfileProps {
  memberId: Id<"members">;
  onClose: () => void;
}

export const Profile = ({ memberId, onClose }: ProfileProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: currentMember, isLoading: loadingCurrentMember } =
    useCurrentMember({ workspaceId });
  const { data: member, isLoading: isMemberLoading } = useGetMemberById({
    memberId,
  });
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();
  const { mutate: updateMemberRole, isPending: isUpdatingMemberRole } =
    useUpdateMemberRole();

  const [LeaveDialog, confirmLeave] = useConfirm(
    "Leave workspace",
    "Are you sure you want to leave this workspace?"
  );
  const [RemoveDialog, confirmRemove] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this member?"
  );
  const [UpdateDialog, confirmUpdate] = useConfirm(
    "Change role",
    "Are you sure you want to change this members role?"
  );

  const onRemove = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    removeMember(
      { memberId, workspaceId },
      {
        onSuccess() {
          toast.success("Member has been successfully removed from workspace");
          onClose();
        },
        onError() {
          toast.error("Failed to remove member");
        },
      }
    );
  };
  const onLeave = async () => {
    const ok = await confirmLeave();
    if (!ok) return;

    removeMember(
      { memberId, workspaceId },
      {
        onSuccess() {
          toast.success("You left the workspace");
          router.replace("/");
        },
        onError() {
          toast.error("Failed to leave workspace");
        },
      }
    );
  };
  const onUpdateMemberRole = async (role: "admin" | "member") => {
    const ok = await confirmUpdate();
    if (!ok) return;

    updateMemberRole(
      { memberId, workspaceId, role },
      {
        onSuccess(data) {
          toast.success(`Role changed to ${data?.role}`);
          //   onClose();
        },
        onError() {
          toast.error("Failed to change role");
        },
      }
    );
  };

  if (isMemberLoading || loadingCurrentMember) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-2 border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex items-center  flex-col gap-y-2 justify-center h-full w-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!member || !currentMember) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-2 border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex items-center flex-col gap-y-2 justify-center h-full w-full">
          <AlertTriangle className="size-5  text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }
  const avatarFallback = member?.user.name?.charAt(0).toUpperCase() ?? "M";

  return (
    <>
      <RemoveDialog />
      <LeaveDialog />
      <UpdateDialog />
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-2 border-b">
          <p className="text-lg font-bold">
            Profile current-({currentMember.role}){" "}
          </p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex items-center flex-col  justify-center p-4 w-full">
          Role-({member.role})
          <Avatar className="max-w-[256px] max-h-[256px] size-full">
            <AvatarImage src={member.user.image} />
            <AvatarFallback className="text-6xl aspect-square">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="font-bold text-xl">{member.user.name}</p>

          {/* buttons */}
          {currentMember.role === "admin" && currentMember._id !== memberId ? (
            <div className="flex items-center gap-2 mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full capitalize">
                    {member.role} <ChevronDownIcon className="size-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={member.role}
                    onValueChange={(role) =>
                      onUpdateMemberRole(role as "admin" | "member")
                    }
                  >
                    <DropdownMenuRadioItem
                      value="admin"
                      disabled={isUpdatingMemberRole}
                    >
                      Admin
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="member"
                      disabled={isUpdatingMemberRole}
                    >
                      Member
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                className="w-full "
                onClick={onRemove}
                disabled={isRemovingMember}
              >
                Remove
              </Button>
            </div>
          ) : currentMember._id === memberId &&
            currentMember.role !== "admin" ? (
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={onLeave}
                disabled={isRemovingMember}
              >
                Leave
              </Button>
            </div>
          ) : null}
        </div>
        <Separator />
        <div className="flex flex-col p-4">
          <p className="text-sm font-bold mb-4 ">Contact Information</p>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-md bg-muted flex items-center justify-center ">
              <MailIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email Address
              </p>
              <Link
                href={`mailto:${member.user.email}`}
                className="underline text-sm text-[#1264a3]"
              >
                {member.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
