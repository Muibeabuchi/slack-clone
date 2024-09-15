import { FaChevronDown } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogHeader,
} from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
import { ChangeEvent, ReactEventHandler, useState } from "react";
import { Input } from "@/components/ui/input";
import { useEditChannelName } from "@/features/channels/api/use-update-channel";
import useChannelId from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import useCurrentMember from "@/features/members/api/use-current-member";

interface HeaderProps {
  headerTitle: string;
}

export default function Header({ headerTitle }: HeaderProps) {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const [editOpen, setEditOpen] = useState(false);
  const [value, setValue] = useState("");
  const { mutate: editChannelName, isPending: editingChannelName } =
    useEditChannelName();
  const { mutate: deleteChannel, isPending: deletingChannel } =
    useRemoveChannel();

  const [ConfirmModal, confirm] = useConfirm(
    "Are you sure?",
    "This action cannot be undone"
  );

  const handleEditOpen = (value: boolean) => {
    if (!currentMember) return;
    if (currentMember.role === "member") return;
    setEditOpen(value);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    // convert whitespaces to dashes
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  };

  const handleDelete = async () => {
    const ok = await confirm?.();
    if (!ok) return;
    deleteChannel(
      {
        channelId,
      },
      {
        onSuccess() {
          toast.success("Channel successfuly deleted");
          router.push(`/workspace/${workspaceId}`);
          // handleClose();
        },
        onError() {
          toast.error("Failed to delete the channel.");
        },
      }
    );
  };

  const handleEdit: ReactEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    editChannelName(
      {
        channelName: value,
        workspaceId,
        channelId,
      },
      {
        onSuccess() {
          toast.success("Channel name updated");
          setEditOpen(false);
          // router.push(`/workspace/${workspaceId}/channel/${channelId}`);
          // handleClose();
        },
        onError() {
          toast.error("Failed to update the channel name");
        },
      }
    );
  };

  return (
    <>
      <ConfirmModal />
      <div className="bg-white border-b border-gray-300 h-[49px] flex items-center px-4 overflow-hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={"ghost"}
              className="text-lg font-semibold w-auto px-2 overflow-hidden"
              size="sm"
            >
              <span className="truncate"># {headerTitle}</span>
              <FaChevronDown className="size-2.5 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 bg-gray-50 overflow-hidden">
            <DialogHeader className="p-4 border-b border-white">
              <DialogTitle># {headerTitle}</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4 flex flex-col gap-y-2">
              <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                <DialogTrigger asChild>
                  <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Channel Name</p>
                      {currentMember?.role === "admin" ? (
                        <p className="text-sm text-[#126483] hover:underline font-semibold">
                          Edit
                        </p>
                      ) : null}
                    </div>
                    <p className="text-sm"># {headerTitle}</p>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename this channel</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEdit} className="space-y-4">
                    <Input
                      value={value}
                      disabled={editingChannelName}
                      onChange={onChange}
                      required
                      autoFocus
                      minLength={3}
                      maxLength={80}
                      placeholder="eg. Plan-budget"
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          variant={"outline"}
                          disabled={editingChannelName}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button disabled={editingChannelName}>Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {currentMember?.role === "admin" ? (
                <button
                  onClick={handleDelete}
                  disabled={deletingChannel || currentMember?.role !== "admin"}
                  className="flex items-center px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 gap-x-2 text-rose-600"
                >
                  <TrashIcon className="size-4 " />
                  <p className="text-sm font-semibold">Delete Channel</p>
                </button>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
