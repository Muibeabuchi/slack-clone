import { Id } from "../../../../convex/_generated/dataModel";

interface WorkspaceIdProps {
  params: {
    workspaceId: Id<"workspaces">;
  };
}

const WorkspaceIdPage = ({ params }: WorkspaceIdProps) => {
  return <div>page:{params.workspaceId}</div>;
};

export default WorkspaceIdPage;
