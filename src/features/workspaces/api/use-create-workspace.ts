import { useServerAction } from "zsa-react";
import { createWorkspaceAction } from "../actions";
import { toast } from "sonner";
import { Dispatch } from "react";
import { SetStateAction } from "jotai";

export default function useCreateWorkspace(
  handleClose: () => void,
  setWorkspaceName: Dispatch<SetStateAction<string>>
) {
  const { execute: createWorkspace, isPending } = useServerAction(
    createWorkspaceAction,
    {
      onSuccess() {
        // close the modal
        handleClose();
        // reset form field
        setWorkspaceName("");
        // toast success
        toast.success("Workspace created");
      },
      onError() {
        toast.error("There was error creating the workspace");
      },
    }
  );
  return { createWorkspace, isPending } as const;
}
