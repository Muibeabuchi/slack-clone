"use client";

import VerificationInput from "react-verification-input";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";
import useGetWorkspaceInfo from "@/features/workspaces/api/get-workspace-info";
import { LoaderIcon } from "lucide-react";
import { useJoinWorkSpace } from "@/features/workspaces/api/use-join-workspace";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";

interface JoinWorkspacePageProps {
  params: {
    workspaceId: Id<"workspaces">;
  };
}

const JoinWorkspacePage = ({
  params: { workspaceId },
}: JoinWorkspacePageProps) => {
  const router = useRouter();
  const { isLoading: workspaceInfoLoading, workspaceInfo } =
    useGetWorkspaceInfo(workspaceId);
  const { mutate: joinWorkspace, isPending: joiningWorkspace } =
    useJoinWorkSpace();

  const handleJoinWorkspace = (code: string) => {
    joinWorkspace(
      { joinCode: code, workspaceId },
      {
        onSuccess(id) {
          toast.success("Workspace joined");
          router.replace(`/workspace/${id?.workspaceId}`);
        },
        onError() {
          toast.error("Failed to join workspace");
        },
      }
    );
  };

  const verificationInputStyles = useMemo(
    () => ({
      container: cn(
        "flex gap-x-2",
        joiningWorkspace && "opacity-50 cursor-not-allowed"
      ),
      character:
        "uppercase h-auto rounded-md border border-gray-300 flex items-center text-lg font-md text-gray-500 justify-center",
      characterInactive: "bg-muted",
      characterSelected: "text-black bg-white ",
      characterFilled: "bg-white text-black",
    }),
    [joiningWorkspace]
  );

  const isMember = useMemo(
    () => workspaceInfo?.isMember,
    [workspaceInfo?.isMember]
  );

  useEffect(() => {
    if (isMember) {
      router.push(`/workspace/${workspaceId}`);
    }
  }, [router, workspaceId, isMember]);

  if (workspaceInfoLoading) {
    return (
      <div className="flex h-full justify-center items-center">
        <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full gap-y-8 flex flex-col justify-center items-center bg-white p-8 rounded-lg shadow-md">
      <Image
        src="/4375082_logo_slack_hashtag_icon.svg"
        alt="hashtag svg"
        width={160}
        height={160}
      />
      <div className="flex flex-col items-center justify-center max-w-md gap-y-4">
        <div className="flex gap-y-2 flex-col items-center justify-center">
          <h1 className="text-2xl fount-bold">
            Join {workspaceInfo?.workspaceName || "Workspace"}
          </h1>
          <p className="text-md text-muted-foreground">
            Enter the workspace code to join
          </p>
        </div>
        <VerificationInput
          autoFocus
          length={6}
          classNames={verificationInputStyles}
          onComplete={handleJoinWorkspace}
        />
      </div>
      <div className="flex gap-x-4">
        <Button size="lg" variant={"outline"} asChild>
          <Link href={"/"}>Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinWorkspacePage;
