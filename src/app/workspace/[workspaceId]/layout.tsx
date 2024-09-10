import Toolbar from "./toolbar";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  return (
    <div className="">
      <Toolbar />
      {children}
    </div>
  );
};

export default WorkspaceLayout;
