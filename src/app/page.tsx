import UserButton from "@/features/auth/components/user-button";

import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect, RedirectType } from "next/navigation";
import ClientDedirect from "./_components/client-redirect";

export default async function Home() {
  const response = await fetchQuery(
    api.workspaces.get,
    {},
    {
      token: convexAuthNextjsToken(),
    }
  );
  // if(!response)
  const workspaceId = response?.[0]?._id;
  if (workspaceId) {
    redirect(`/workspace/${workspaceId}`, "replace" as RedirectType);
  }
  // console.log(response);

  // const { data, isLoading } = useWorkSpaces();

  return (
    <div>
      <ClientDedirect workspaceId={workspaceId} />
      <UserButton />
    </div>
  );
}
