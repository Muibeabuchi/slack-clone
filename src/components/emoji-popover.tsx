import React, { ReactNode, useState } from "react";

import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

// import Picker from "@emoji-mart/react";
// import data from "@emoji-mart/data";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";

interface EmojiPickerProps {
  children: ReactNode;
  hint?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEmojiSelect: (value: string) => void;
}

export default function EmojiPopover({
  children,
  hint = "emoji",
  onEmojiSelect,
}: EmojiPickerProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelectEmoji = (value: EmojiClickData) => {
    onEmojiSelect(value.emoji);
    setPopoverOpen(false);
    setTimeout(() => {
      setTooltipOpen(false);
    }, 500);
  };

  return (
    <TooltipProvider>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip
          open={tooltipOpen}
          onOpenChange={setTooltipOpen}
          delayDuration={50}
        >
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent className="bg-black text-white border border-white/5">
            <p className="font-medium text-xs">{hint}</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="p-0 w-full border-none shadow-none">
          <EmojiPicker onEmojiClick={onSelectEmoji} />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
