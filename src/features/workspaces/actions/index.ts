"use server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { createServerAction } from "zsa";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { z } from "zod";
import { redirect } from "next/navigation";
// import { revalidatePath } from "next/cache";

export const createWorkspaceAction = createServerAction()
  .input(
    z.object({
      name: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const workspaceId = await fetchMutation(
      api.workspaces.create,
      { name: input.name },
      {
        token: convexAuthNextjsToken(),
      }
    );

    if (workspaceId) {
      // revalidatePath("/");
      redirect(`/workspace/${workspaceId}`);
    }
  });
