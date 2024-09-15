import { ReactNode } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { redirect } from "next/navigation";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

interface JoinWorkspaceLayoutProps {
  children: ReactNode;
  params: {
    workspaceId: Id<"workspaces">;
  };
}

export default async function JoinWorkspaceLayout({
  children,
  params,
}: JoinWorkspaceLayoutProps) {
  const workspaceInfo = await fetchQuery(
    api.workspaces.getWorkspaceInfo,
    {
      workspaceId: params.workspaceId,
    },
    {
      token: convexAuthNextjsToken(),
    }
  );
  if (workspaceInfo.isMember) {
    redirect(`/workspace/${params.workspaceId}`);
  }
  return <div>{children}</div>;
}
