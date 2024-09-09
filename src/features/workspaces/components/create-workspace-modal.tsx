"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateWorkSpaceModal } from "../store/use-create-workspace-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateWorkSpaces } from "../api/use-create-workspace";
import { useState } from "react";

export const CreateWorkSpaceModal = () => {
  const [open, setOpen] = useCreateWorkSpaceModal();
  const { mutate } = useCreateWorkSpaces();

  const handleClose = () => {
    // await mutate();
    setOpen(false);
    // todo:clear the form
  };

  const handleSubmit = async () => {
    const response = await mutate(
      {
        name: "Workspace 1",
      },
      {
        onSuccess(data) {
          // redirect to workspace id
        },
        onError(error) {},
        onSettled() {},
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Workspace</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <Input
            value=""
            disabled={false}
            autoFocus
            required
            placeholder="Workspace name e.g. 'Work','Personal','Home'"
            onChange={() => {}}
          />
          <div className="flex justify-end">
            <Button disabled={false}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
