"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateWorkSpaceModal } from "../store/use-create-workspace-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateWorkSpaces } from "../api/use-create-workspace";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const CreateWorkSpaceModal = () => {
  const router = useRouter();
  const [open, setOpen] = useCreateWorkSpaceModal();
  const [workspaceName, setWorkspaceName] = useState("");
  const { mutate, isPending } = useCreateWorkSpaces();

  const handleClose = () => {
    setOpen(false);
    // todo:clear the form
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workspaceName) return;
    mutate(
      // remove whitspace from the workspace name
      { name: workspaceName.trim() },
      {
        onSuccess(id) {
          // redirect to workspace id
          // setOpen(false);
          toast.success("Workspace created");
          handleClose();
          setWorkspaceName("");
          router.push(`/workspace/${id}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Workspace</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            value={workspaceName}
            disabled={isPending}
            autoFocus
            required
            placeholder="Workspace name e.g. 'Work','Personal','Home'"
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
