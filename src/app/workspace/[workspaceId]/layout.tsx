import { fetchQuery } from "convex/nextjs";

import Sidebar from "./_components/sidebar";
import Toolbar from "./_components/toolbar";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { redirect } from "next/navigation";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import WorkspaceSwitcher from "./_components/workspace-switcher";

import { cookies } from "next/headers";
import ResizeableSidebar from "@/features/workspaces/components/resizeable-panel";
import WorkspaceSidebar from "./_components/workspace-sidebar";
import { preloadCurrentMember } from "@/features/members/api/use-preload-current-member";
import { preloadWorkspace } from "@/features/workspaces/api/use-preload-workspace";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: {
    workspaceId: Id<"workspaces">;
  };
}

const WorkspaceLayout = async ({
  children,
  params: { workspaceId },
}: WorkspaceLayoutProps) => {
  const layout = cookies().get("react-resizable-panels:layout");

  let defaultLayout;
  if (layout) {
    defaultLayout = JSON.parse(layout.value);
  }
  const workspace = await fetchQuery(
    api.workspaces.getById,
    { workspaceId },
    {
      token: convexAuthNextjsToken(),
    }
  );

  // prefetch data for the workspaceSidebae component
  const preloadedCurrentMember = await preloadCurrentMember(workspaceId);
  const preloadedWorkspace = await preloadWorkspace(workspaceId);

  if (!workspace) redirect("/");
  return (
    <div className="">
      <Toolbar workspaceName={workspace.name} />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar>
          <WorkspaceSwitcher workspace={workspace} />
        </Sidebar>
        <ResizeableSidebar
          workspaceSidebar={
            <WorkspaceSidebar
              preloadedWorkspace={preloadedWorkspace}
              preloadedCurrentMember={preloadedCurrentMember}
            />
          }
          defaultLayout={defaultLayout}
        >
          {children}
        </ResizeableSidebar>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
