import { fetchQuery, preloadQuery } from "convex/nextjs";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import Sidebar from "./_components/sidebar";
import Toolbar from "./_components/toolbar";
import WorkspaceSwitcher from "./_components/workspace-switcher";
import WorkspaceSidebar from "./_components/workspace-sidebar";

import ResizeableSidebar from "@/features/workspaces/components/resizeable-panel";

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

  const membersPreloadQuery = await preloadQuery(
    api.members.workspaceMembers,
    {
      workspaceId,
    },
    {
      token: convexAuthNextjsToken(),
    }
  );
  const channelsPreloadQuery = await preloadQuery(
    api.channels.get,
    {
      workspaceId,
    },
    {
      token: convexAuthNextjsToken(),
    }
  );

  if (!workspace) redirect("/");
  return (
    <div className="">
      <Toolbar
        workspaceName={workspace.name}
        membersPreloadQuery={membersPreloadQuery}
        channelsPreloadQuery={channelsPreloadQuery}
      />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar>
          <WorkspaceSwitcher workspace={workspace} />
        </Sidebar>
        <ResizeableSidebar
          workspaceSidebar={
            <WorkspaceSidebar
              membersPreloadQuery={membersPreloadQuery}
              channelsPreloadQuery={channelsPreloadQuery}
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
