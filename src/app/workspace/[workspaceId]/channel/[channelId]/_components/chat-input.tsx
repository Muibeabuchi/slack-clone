"use client";

import dynamic from "next/dynamic";
import Quill from "quill";
import { useMemo, useRef, useState } from "react";

import { useCreateMessage } from "@/features/messages/api/use-create-message";

import useChannelId from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";

interface ChatInputProps {
  placeholder: string;
}

const ChatInput = ({ placeholder }: ChatInputProps) => {
  const DynamicEditor = useMemo(() => {
    return dynamic(() => import("@/components/editor"), { ssr: false });
  }, []);

  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const ref = useRef<Quill | null>(null);
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { mutate: createMessage } = useCreateMessage();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    console.log({ body, image });

    try {
      setIsPending(true);
      // disable the text editor
      ref.current?.enable(false);
      // await new Promise((resolve) => setTimeout(() => resolve(true), 7000));
      await createMessage(
        {
          body,
          workspaceId,
          channelId,
          // parentMessageId,
        },
        {
          throwError: true,
        }
      );
      //! Destroy editor component to reset state
      setEditorKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      // unneccessary as the editor component instance is destroyed and recreated 👍
      // ref.current?.enable(false);
    }
  };

  return (
    <div className="w-full px-5 pb-5">
      <DynamicEditor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={ref}
        onCancel={() => {}}
        defaultValue={[]}
        variant="create"
      />
    </div>
  );
};

export default ChatInput;
