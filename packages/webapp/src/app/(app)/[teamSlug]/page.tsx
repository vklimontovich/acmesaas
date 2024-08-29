import { PageContent, PageHeader } from "@/components/page-header";
import { getPageContext } from "@/lib/server/team-page-context";

const DashboardPage: React.FC<{}> = async props => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const context = await getPageContext(props);
  return (
    <div>
      <PageHeader description="Welcome to the dashboard">Dashboard</PageHeader>
      <PageContent>
        <pre>{JSON.stringify(context, null, 2)}</pre>
      </PageContent>
    </div>
  );
};

export default DashboardPage;
