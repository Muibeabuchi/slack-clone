import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";

// type ResponseType = RegisteredMutation<"public", NonNullable<unknown>, Promise<string>>;

type Options = {
  onSuccess?: (data: string | null) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useGenerateUploadUrl = () => {
  const mutation = useMutation(api.upload.generateUploadUrl);

  const [data, setData] = useState<string | null>(null);
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
    async (_values: NonNullable<unknown>, options: Options) => {
      setData(null);
      setError(null);
      setStatus("pending");
      // setIsSuccess(false);
      // setIsError(false);
      // setIsSettled(false);
      // setIsPending(true);

      try {
        const response = await mutation();
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
