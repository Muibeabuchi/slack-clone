"use client";

import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";

import { useCreateMessage } from "@/features/messages/api/use-create-message";

import useChannelId from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { Id } from "../../../../../../../convex/_generated/dataModel";

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage">;
};

interface ChatInputProps {
  placeholder: string;
}

const DynamicEditor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

const ChatInput = ({ placeholder }: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const ref = useRef<Quill | null>(null);
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      // disable the text editor
      ref.current?.enable(false);
      // await new Promise((resolve) => setTimeout(() => resolve(true), 7000));

      const values: CreateMessageValues = {
        body,
        channelId,
        workspaceId,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });

        if (!url) throw new Error("url not found");

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-type": image.type },
          body: image,
        });

        if (!response.ok) throw new Error("Failed to upload image");

        const { storageId } = await response.json();
        values.image = storageId;
      }
      await createMessage(values, {
        throwError: true,
      });
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
