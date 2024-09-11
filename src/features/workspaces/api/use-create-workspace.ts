// import { useMutation } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { useCallback, useMemo, useState } from "react";
// import { Id } from "../../../../convex/_generated/dataModel";

import { useServerAction } from "zsa-react";
import { createWorkspaceAction } from "../actions";
import { toast } from "sonner";
import { Dispatch } from "react";
import { SetStateAction } from "jotai";

// type RequestType = { name: string };
// type ResponseType = Id<"workspaces"> | null;

// type Options = {
//   onSuccess?: (data: ResponseType) => void;
//   onError?: (error: Error) => void;
//   onSettled?: () => void;
//   throwError?: boolean;
// };

// export const useCreateWorkSpaces = () => {
//   const mutation = useMutation(api.workspaces.create);

//   const [data, setData] = useState<ResponseType>(null);
//   const [error, setError] = useState<Error | null>(null);

//   const [status, setStatus] = useState<
//     "success" | "error" | "settled" | "pending" | null
//   >(null);

//   const isSuccess = useMemo(() => status === "success", [status]);
//   const isPending = useMemo(() => status === "pending", [status]);
//   const isSettled = useMemo(() => status === "settled", [status]);
//   const isError = useMemo(() => status === "error", [status]);

//   // const [isPending, setIsPending] = useState(false);
//   // const [isError, setIsError] = useState(false);
//   // const [isSettled, setIsSettled] = useState(false);
//   // const [isSuccess, setIsSuccess] = useState(false);

//   const mutate = useCallback(
//     async (values: RequestType, options: Options) => {
//       setData(null);
//       setError(null);
//       setStatus("pending");
//       // setIsSuccess(false);
//       // setIsError(false);
//       // setIsSettled(false);
//       // setIsPending(true);

//       try {
//         const response = await mutation(values);
//         options?.onSuccess?.(response);
//         setData(response);
//         setStatus("success");
//         // setIsError(false);

//         return response;
//       } catch (err) {
//         options?.onError?.(err as Error);
//         setStatus("error");
//         setError(err as Error);
//         // if (err) {
//         //   if (err === typeof Error) {
//         //     setError(err);
//         //   }
//         // }
//         if (options?.throwError) throw Error;
//       } finally {
//         setStatus("settled");
//         options?.onSettled?.();
//         // setStatus(false);
//         // setIsSettled(true);
//       }
//     },
//     [mutation]
//   );

//   return {
//     mutate,
//     data,
//     error,
//     isPending,
//     isSettled,
//     isSuccess,
//     isError,
//     status,
//   };
// };

export default function useCreateWorkspace(
  handleClose: () => void,
  setWorkspaceName: Dispatch<SetStateAction<string>>
) {
  const {
    execute: createWorkspace,
    isPending,
    // data: workspaceId,
  } = useServerAction(createWorkspaceAction, {
    onSuccess() {
      // close the modal
      handleClose();
      // reset form field
      setWorkspaceName("");
      // toast success
      toast.success("Workspace created");
      // redirect to workspace page
      // if (workspaceId) {
      //   router.push(`/workspace/${workspaceId}`);
      // }
    },
  });
  return { createWorkspace, isPending } as const;
}
