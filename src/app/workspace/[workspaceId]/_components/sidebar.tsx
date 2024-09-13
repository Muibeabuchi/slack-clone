import UserButton from "@/features/auth/components/user-button";
import SidebarButton from "./sidebar-button";
import {
  BellIcon,
  Home,
  MessagesSquareIcon,
  MoreHorizontalIcon,
} from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
      {children}
      <SidebarButton icon={Home} isActive label="Home" />
      <SidebarButton icon={MessagesSquareIcon} isActive={false} label="DMs" />
      <SidebarButton icon={BellIcon} label="Activity" isActive={false} />
      <SidebarButton icon={MoreHorizontalIcon} label="More" isActive={false} />
      <div className="flex-col flex items-center justify-center gap-y-1 mt-auto">
        <UserButton />
      </div>
    </aside>
  );
}
