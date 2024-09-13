"use client";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRemoveWorkSpaces } from "@/features/workspaces/api/use-remove-workspace";
import { useUpdateWorkSpaces } from "@/features/workspaces/api/use-update-workspace";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

interface PrefrencesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
}

export default function PreferenceModal({
  initialValue,
  open,
  setOpen,
}: PrefrencesModalProps) {
  const [ConfirmDialog, controlConfirmDialog] = useConfirm(
    "Are you sure?",
    "This action is irreversible"
  );
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const [openEditWorkspaceModal, setOpenEditWorkspaceModal] = useState(false);
  const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } =
    useUpdateWorkSpaces();
  const { mutate: removeWorkspace, isPending: isRemovingWorkspace } =
    useRemoveWorkSpaces();
  const [value, setValue] = useState(initialValue);

  const handleEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateWorkspace(
      { workspaceId, newWorkspaceName: value },
      {
        onSuccess() {
          toast.success("Workspace name updated");
          setOpenEditWorkspaceModal(false);
        },
        onError() {
          toast.error("Failed to update workspace");
        },
      }
    );
  };

  const handleRemove = async () => {
    console.log("await alertdialog");
    const ok = await controlConfirmDialog();
    if (!ok) return;
    removeWorkspace(
      {
        workspaceId,
      },
      {
        onSuccess() {
          toast.success("Workspace removed");
          router.replace(`/`);
        },
        onError() {
          toast.error("Failed to remove workspace");
        },
      }
    );
  };
  return (
    <>
      {<ConfirmDialog />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden bg-gray-50">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>{value}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog
              open={openEditWorkspaceModal}
              onOpenChange={setOpenEditWorkspaceModal}
            >
              <DialogTrigger
                asChild
                onClick={() => setOpenEditWorkspaceModal(true)}
              >
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Workspace name</p>
                    <p className="text-sm text-[#126483] hover:underline font-semibold">
                      Edit
                    </p>
                  </div>
                  <p className="text-sm">{value}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this workspace</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleEdit}>
                  <Input
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                    }}
                    disabled={isUpdatingWorkspace}
                    autoFocus
                    required
                    minLength={3}
                    maxLength={80}
                    placeholder="Workspace name e.g. 'Work','Personal','Home'"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant={"outline"}
                        disabled={isUpdatingWorkspace}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdatingWorkspace}>Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <button
              disabled={isRemovingWorkspace}
              onClick={handleRemove}
              className="gap-x-2 items-center focus:outline-none flex px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">Delete workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
