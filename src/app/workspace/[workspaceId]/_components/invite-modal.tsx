import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateWorkSpaceJoincode } from "@/features/workspaces/api/use-update-workspace-joicode";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { DialogDescription } from "@radix-ui/react-dialog";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { toast } from "sonner";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  workspaceName: string;
  joinCode: string;
}

const confirmPrompt = [
  "Are you sure?",
  "This will deactivate the current invite code and generate a new one",
] as const;

export default function InviteModal({
  open,
  setOpen,
  joinCode,
  workspaceName,
}: InviteModalProps) {
  //   const [] = useClipboard();
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(...confirmPrompt);
  const { mutate: updateJoincode, isPending: updatingJoincode } =
    useUpdateWorkSpaceJoincode();

  //  BUG: fix the closing of the dialog whenever the confirm dialog is closed
  const handleNewcode = async () => {
    const ok = await confirm();
    if (!ok) return;

    updateJoincode(
      {
        workspaceId,
      },
      {
        onSuccess() {
          toast.success(
            `Joincode for ${workspaceName} workspace has been updated`
          );
        },
        onError() {
          toast.error("there was an error updating the joincode. Try again ");
        },
      }
    );
  };
  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => toast.success("Invite link copied to clipboard"))
      .catch(() => toast.error("Error copying the invite link"));
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite People to {workspaceName}</DialogTitle>
            <DialogDescription>
              Use the code below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-y-4 justify-center items-center py-10 flex-col">
            <p className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </p>
            <Button onClick={handleCopy} variant={"ghost"} size="sm">
              Copy Link
              <CopyIcon className="size-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={handleNewcode}
              disabled={updatingJoincode}
            >
              New Code
              <RefreshCcwIcon className="size-4 ml-2" />
            </Button>
            <DialogClose asChild disabled={updatingJoincode}>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
