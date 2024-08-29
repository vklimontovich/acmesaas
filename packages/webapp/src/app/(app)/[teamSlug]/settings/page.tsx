import { TeamSettingsEditor } from "@/components/team-settings-editor";
import { PageContent, PageHeader } from "@/components/page-header";
import { Skeleton, Tabs } from "antd";
import { ReactNode, Suspense } from "react";
import { getPageContext } from "@/lib/server/team-page-context";
import { TeamSettings } from "@/lib/schema/team-settings";
import { pick } from "lodash";
import { TeamAccessEditor } from "@/components/team-access-editor";
import { BillingTab } from "@/components/billing-tab";

const SettingsSection: React.FC<{ title: string; children: React.ReactNode; description: ReactNode }> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="flex flex-row gap-8 border-b border-background-dark mb-6 pb-6 ">
      <div className=" max-w-[300px] w-[300px] min-w-[300px]">
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="text-sm font-lighter text-foreground-light">{description}</div>
      </div>
      <div className="grow">{children}</div>
    </div>
  );
};

const SettingsPage: React.FC<{ searchParams: any }> = async props => {
  const { user, team } = await getPageContext(props);
  return (
    <div>
      <PageHeader description={"Configure your team"}>Settings</PageHeader>
      <PageContent>
        <Tabs
          defaultActiveKey={props.searchParams.section || "team"}
          items={[
            {
              key: "team",
              label: "Team",
              children: (
                <div>
                  <SettingsSection title="General" description="Change a name and slug for your team">
                    <div className="flex justify-start">
                      <TeamSettingsEditor
                        className="min-w-[500px]"
                        currentSettings={pick(team, Object.keys(TeamSettings.shape))}
                        buttonTitle={"Save"}
                        size="middle"
                      />
                    </div>
                  </SettingsSection>
                  <SettingsSection title="Access" description="Control who can access your team">
                    <Suspense fallback={<Skeleton title={false} active paragraph={{ rows: 3 }} />}>
                      <TeamAccessEditor teamId={team.id} userId={user.id} />
                    </Suspense>
                  </SettingsSection>
                </div>
              ),
            },
            {
              key: "billing",
              label: "Billing",
              children: (
                <Suspense fallback={<Skeleton title={false} active paragraph={{ rows: 3 }} />}>
                  <BillingTab teamId={team.id} />
                </Suspense>
              ),
            },
          ]}
        />
      </PageContent>
    </div>
  );
};

export default SettingsPage;
