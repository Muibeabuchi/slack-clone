"use client";

import dynamic from "next/dynamic";
import Quill from "quill";
import { useMemo, useRef } from "react";

interface ChatInputProps {
  placeholder: string;
}

const ChatInput = ({ placeholder }: ChatInputProps) => {
  const DynamicEditor = useMemo(() => {
    return dynamic(() => import("@/components/editor"), { ssr: false });
  }, []);

  const ref = useRef<Quill | null>(null);

  return (
    <div className="w-full px-5 pb-5">
      <DynamicEditor
        placeholder={placeholder}
        onSubmit={() => {}}
        disabled={false}
        innerRef={ref}
        onCancel={() => {}}
        defaultValue={[]}
        variant="create"
      />
    </div>
  );
};

export default ChatInput;
