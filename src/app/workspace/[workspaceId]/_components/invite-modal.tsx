// import { useClipboard } from "@reactuses/core";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { DialogDescription } from "@radix-ui/react-dialog";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  workspaceName: string;
  joinCode: string;
}

export default function InviteModal({
  open,
  setOpen,
  joinCode,
  workspaceName,
}: InviteModalProps) {
  //   const [] = useClipboard();
  const workspaceId = useWorkspaceId();
  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => toast.success("Invite link copied to clipboard"))
      .catch(() => toast.error("Error copying the invite link"));
  };

  return (
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
      </DialogContent>
    </Dialog>
  );
}
