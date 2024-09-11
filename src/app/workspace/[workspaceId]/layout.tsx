import { fetchQuery } from "convex/nextjs";

import Sidebar from "./sidebar";
import Toolbar from "./toolbar";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { redirect } from "next/navigation";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import WorkspaceSwitcher from "./workspace-switcher";

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
  const workspace = await fetchQuery(
    api.workspaces.getById,
    { workspaceId },
    {
      token: convexAuthNextjsToken(),
    }
  );

  console.log(workspace);
  if (!workspace) redirect("/");
  return (
    <div className="">
      <Toolbar workspaceName={workspace.name} />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar>
          <WorkspaceSwitcher workspace={workspace} />
        </Sidebar>
        {children}
      </div>
    </div>
  );
};

export default WorkspaceLayout;
