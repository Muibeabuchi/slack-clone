import Quill, { type QuillOptions } from "quill";
import { ImageIcon, SmileIcon, XIcon } from "lucide-react";
import { Delta, Op } from "quill/core";

// import "react-quill/dist/quill.snow.css";
// import "quill/dist/quill.snow.css";

import { Button } from "./ui/button";
import Hint from "./hint";

import React, {
  MutableRefObject,
  useEffect,
  useRef,
  // useMemo,
  useState,
  useLayoutEffect,
  useMemo,
} from "react";

import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import { cn } from "@/lib/utils";
import EmojiPicker from "./emoji-picker";
import Image from "next/image";

type EditorValue = { image: File | null; body: string };

interface EditorProps {
  variant?: "create" | "update";
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
}

const Editor = ({
  variant = "create",
  defaultValue = [],
  onSubmit,
  disabled = false,
  innerRef,
  onCancel,
  placeholder = "Write something",
}: EditorProps) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const imageBlob = useMemo(() => {
    if (!image) return;
    return URL.createObjectURL(image!);
  }, [image]);

  // console.log(image);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);
  const imageRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    // quillRef = null;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(
    function () {
      if (!containerRef.current) return;
      const container = containerRef.current;
      // const editorContainer = container.appendChild(
      //   container.ownerDocument.createElement("div")
      // );

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );

      const options: QuillOptions = {
        theme: "snow",
        placeholder: placeholderRef.current,
        modules: {
          // "image-tooltip": false,
          keyboard: {
            bindings: {
              enter: {
                key: "Enter",
                handler: () => {
                  // submit the form
                  const text = quill.getText();
                  const addedImage = imageRef.current?.files?.[0] || null;

                  const isEmpty =
                    !addedImage &&
                    text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                  console.log("ready...");
                  if (isEmpty) return;
                  console.log("submitting");
                  submitRef.current?.({
                    body: JSON.stringify(quill.getContents()),
                    image: addedImage,
                  });
                },
              },
              shift_enter: {
                key: "Enter",
                shiftkey: true,
                handler: () => {
                  quill.insertText(quill.getSelection()?.index || 0, "\n");
                },
              },
            },
          },
        },
      };

      const quill = new Quill(editorContainer, options);
      quillRef.current = quill;
      quillRef.current.focus();

      if (innerRef) {
        innerRef.current = quill;
      }

      quill.setContents(defaultValueRef.current);
      setText(quill.getText());

      quill.on(Quill.events.TEXT_CHANGE, () => {
        setText(quill.getText());
      });
      return () => {
        quill.off(Quill.events.TEXT_CHANGE);
        if (container) {
          container.innerHTML = "";
        }
        if (innerRef) {
          innerRef.current = null;
        }
        if (quillRef) {
          quillRef.current = null;
        }
      };
    },
    [innerRef]
  );

  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

  const toggleToolBar = () => {
    setIsToolbarVisible((prev) => !prev);
    const toolBarElement = containerRef.current?.querySelector(".ql-toolbar");
    if (toolBarElement) toolBarElement.classList.toggle("hidden");
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEmojiSelect = (emoji: any) => {
    const quill = quillRef.current;
    quill?.insertText(quill.getSelection()?.index || 0, emoji?.native);
  };

  return (
    <div className="flex flex-col ">
      <input
        className="hidden"
        type="file"
        accept="image/*"
        ref={imageRef}
        onChange={(e) => setImage(e.target.files![0])}
      />
      {/* overflow-hidden hiding dropdown of quill editor */}
      <div
        className={cn(
          "flex flex-col border border-slate-200 rounded-md focus-within:border-slate-300 focus-within:shadow-sm transition bg-white",
          disabled && "opacity-50"
        )}
      >
        <div ref={containerRef} />
        {!!image ? (
          <div className="p-2 ">
            <div className=" relative size-[62px] group/image flex items-center justify-center">
              <Hint label="Remove image">
                <button
                  onClick={() => {
                    // revoke  the  url object
                    if (image) {
                      URL.revokeObjectURL(imageBlob!);
                    }
                    setImage(null);
                    imageRef.current!.value = "";
                  }}
                  className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5  -right-2.5 text-white size-6 z-[4] border-2 border-white  items-center justify-center"
                >
                  <XIcon className="size-3.5" />
                </button>
              </Hint>
              <Image
                src={imageBlob!}
                alt="uploaded"
                fill
                onLoad={() => {
                  if (image) URL.revokeObjectURL(imageBlob!);
                }}
                className="rounded-xl overflow-hidden border object-cover"
              />
            </div>
          </div>
        ) : null}
        <div className="flex px-2 pb-2 z-[5]">
          <Hint
            label={isToolbarVisible ? "Hide formatting" : "Show formatting"}
          >
            <Button
              disabled={disabled}
              size={"iconSm"}
              variant={"ghost"}
              onClick={toggleToolBar}
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          <EmojiPicker onEmojiSelect={onEmojiSelect}>
            <Button disabled={disabled} size={"iconSm"} variant={"ghost"}>
              <SmileIcon className="size-4" />
            </Button>
          </EmojiPicker>
          {variant === "create" ? (
            <Hint label="image">
              <Button
                disabled={disabled}
                size={"iconSm"}
                variant={"ghost"}
                onClick={() => imageRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          ) : null}

          {variant === "update" ? (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                className=" bg-[#007a5a] hover:bg-[#007a5a]/80 text-white "
                onClick={() => {
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  });
                }}
                disabled={disabled || isEmpty}
                size="sm"
              >
                Save
              </Button>
            </div>
          ) : null}

          {variant === "create" ? (
            <Hint label="send">
              <Button
                disabled={isEmpty || disabled}
                onClick={() => {
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  });
                }}
                className={cn(
                  "ml-auto",
                  isEmpty
                    ? "bg-white hover:bg-white text-muted-foreground "
                    : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white "
                )}
                size={"iconSm"}
              >
                <MdSend className="size-4" />
              </Button>
            </Hint>
          ) : null}
        </div>
      </div>
      {variant === "create" ? (
        <div
          className={cn(
            "p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition",

            !isEmpty && "opacity-100"
          )}
        >
          <p>
            <strong>Shift + Return </strong>
            to add a new line
          </p>
        </div>
      ) : null}
    </div>
  );
};

Editor.displayName = "Editor";

export default Editor;
