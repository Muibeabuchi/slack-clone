import {
  Dialog,
  DialogContent,
  //   DialogFooter,
  DialogDescription,
  DialogHeader,
  //   DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateChannelModal } from "../store/use-create-channel-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChangeEvent, ReactEventHandler, useState } from "react";
import { useCreateChannel } from "../api/use-create-channel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateChannelModal() {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [openCreateChannelModal, setOpenCreateChannelModal] =
    useCreateChannelModal();

  const [channelName, setChannelName] = useState("");

  const { mutate: createNewChannel, isPending: channelLoading } =
    useCreateChannel();

  const handleClose = () => {
    setChannelName("");
    setOpenCreateChannelModal(false);
  };

  const handleSubmit: ReactEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    createNewChannel(
      {
        channelName,
        workspaceId,
      },
      {
        onSuccess(channelId) {
          toast.success("Channel created");
          router.push(`/workspace/${workspaceId}/channel/${channelId}`);
          handleClose();
        },
        onError() {
          toast.error("Failed to create the channel");
        },
      }
    );
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    // convert whitespaces to dashes
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setChannelName(value);
  };

  return (
    <Dialog open={openCreateChannelModal} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            value={channelName}
            onChange={onChange}
            disabled={channelLoading}
            required
            autoFocus
            minLength={3}
            maxLength={80}
            placeholder="eg. Plan-budget"
          />
          <div className="justify-end flex">
            <Button disabled={channelLoading}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
