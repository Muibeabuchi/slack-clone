import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = {
  body: string;
  messageId: Id<"messages">;
};
type ResponseType = Id<"messages"> | null;

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useUpdateMessage = () => {
  const mutation = useMutation(api.messages.update);

  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);

  const [status, setStatus] = useState<
    "success" | "error" | "settled" | "pending" | null
  >(null);

  const isSuccess = useMemo(() => status === "success", [status]);
  const isPending = useMemo(() => status === "pending", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);
  const isError = useMemo(() => status === "error", [status]);

  // const [isPending, setIsPending] = useState(false);
  // const [isError, setIsError] = useState(false);
  // const [isSettled, setIsSettled] = useState(false);
  // const [isSuccess, setIsSuccess] = useState(false);

  const mutate = useCallback(
    async (values: RequestType, options: Options) => {
      setData(null);
      setError(null);
      setStatus("pending");
      // setIsSuccess(false);
      // setIsError(false);
      // setIsSettled(false);
      // setIsPending(true);

      try {
        const response = await mutation(values);
        options?.onSuccess?.(response);
        setData(response);
        setStatus("success");
        // setIsError(false);

        return response;
      } catch (err) {
        options?.onError?.(err as Error);
        setStatus("error");
        setError(err as Error);
        // if (err) {
        //   if (err === typeof Error) {
        //     setError(err);
        //   }
        // }
        if (options?.throwError) throw Error;
      } finally {
        setStatus("settled");
        options?.onSettled?.();
        // setStatus(false);
        // setIsSettled(true);
      }
    },
    [mutation]
  );

  return {
    mutate,
    data,
    error,
    isPending,
    isSettled,
    isSuccess,
    isError,
    status,
  };
};
