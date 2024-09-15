import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const useConfirm = (title: string, message: string) => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () =>
    new Promise((resolve) => {
      setPromise({ resolve });
    });

  const handleClose = () => setPromise(null);

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const ConfirmDialog = () => {
    return (
      <Dialog
        open={promise !== null}
        // onOpenChange={() => setPromise(null)}
        // modal={true}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            {/* <DialogCancel asChild> */}
            <Button onClick={handleCancel} variant={"outline"}>
              Cancel
            </Button>
            {/* </DialogCancel> */}
            {/* <DialogAction asChild> */}
            <Button onClick={handleConfirm}>Confirm</Button>
            {/* </DialogAction> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return [ConfirmDialog, confirm] as const;
};
