"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Home() {
  const { signOut } = useAuthActions();
  return (
    <div>
      Hello-world
      <Button onClick={() => signOut()}>Log Out</Button>
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
