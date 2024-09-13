import { PlusIcon } from "lucide-react";
import { ReactNode } from "react";
import { useToggle } from "@reactuses/core";

import { FaCaretDown } from "react-icons/fa";
import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkspaceSectionProps {
  children: ReactNode;
  hint: string;
  label: string;
  onNew?: () => void;
}

export const WorkspaceSection = ({
  children,
  hint,
  label,
  onNew,
}: WorkspaceSectionProps) => {
  const [on, toggle] = useToggle(true);
  return (
    <div className="px-2 mt-3 flex flex-col">
      <div className="flex items-center px-3.5 group">
        <Button
          variant={"transparent"}
          className="p-0.5 text-sm text-[#f9edffcc] shrink-0 size-6"
          onClick={toggle}
        >
          <FaCaretDown
            className={cn("transition-transform size-4", {
              "-rotate-90": on,
            })}
          />
        </Button>
        <Button
          variant={"transparent"}
          size="sm"
          className="group px-1.5 text-sm text-[#f9edffcc] h-[28px] justify-start overflow-hidden items-center"
        >
          <span className="truncate">{label}</span>
        </Button>
        {onNew ? (
          <Hint label={hint} side="top" align="center">
            <Button
              onClick={onNew}
              variant="transparent"
              size="iconSm"
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-0.5 text-sm text-[#f9edffcc] size-6 shrink-0"
            >
              <PlusIcon className="size-5" />
            </Button>
          </Hint>
        ) : null}
      </div>
      {on ? children : null}
    </div>
  );
};
