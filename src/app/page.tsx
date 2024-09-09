"use client";

import UserButton from "@/features/auth/components/user-button";
import { useCreateWorkSpaceModal } from "@/features/workspaces/store/use-create-workspace-modal";

import { useWorkSpaces } from "@/features/workspaces/api/use-get-work-spaces";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Home() {
  const { data, isLoading } = useWorkSpaces();
  const [open, setOpen] = useCreateWorkSpaceModal();
  const router = useRouter();

  const workSpaceId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) return;
    if (workSpaceId) {
      router.replace(`/workspace/${workSpaceId}`);
    } else if (!open) {
      setOpen(true);
      console.log("opening the creation modal");
    }
  }, [isLoading, workSpaceId, open, setOpen, router]);
  return (
    <div>
      <UserButton />
    </div>
  );
}

// export default async function ServerComponent() {
//   // tasks data will be non-reactive
//   const tasks = await fetchQuery(
//     api.tasks.list,
//     { list: "default" },
//     {
//       token: "place your token here",
//     }
//   );

//   return <ClientComponent tasks={tasks} />;
// }

// const ClientComponent = ({ tasks }: ClientComponentProps) => {
//   const { data, isPending, error } = useQuery({
//     ...convexQuery(api.tasks.list, { id: 123 }),
//     initialData: [tasks], // use the prefetched data in here
//     gcTime: 10000, // stay subscribed for 10 seconds after this component unmounts
//   });
// };
