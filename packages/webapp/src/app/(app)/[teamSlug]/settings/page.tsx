import { TeamSettingsEditor } from "@/components/team-settings-editor";
import { PageContent, PageHeader } from "@/components/page-header";
import { Skeleton, Tabs } from "antd";
import { ReactNode, Suspense } from "react";
import { getPageContext } from "@/lib/server/page-context";
import { TeamSettings } from "@/lib/schema/workspace";
import { pick } from "lodash";
import { TeamAccessEditor } from "@/components/team-access-editor";

const SettingsSection: React.FC<{ title: string; children: React.ReactNode, description: ReactNode }> = ({ title, description, children }) => {
  return (
    <div className="flex flex-row gap-8 border-b border-primary-bg-dark mb-6 pb-6 ">
      <div className=" max-w-[300px] w-[300px] min-w-[300px]">
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="text-sm font-lighter text-text-light">
          {description}
        </div>
      </div>
      <div className="grow">
        {children}
      </div>

    </div>
  );

}

const SettingsPage: React.FC = async (props) => {
  const {user, org} = await getPageContext(props)
  return (
    <div>
      <PageHeader description={"Configure your organization"}>Settings</PageHeader>
      <PageContent>
        <Tabs
          defaultActiveKey="org"
          items={[
            {
              key: "org",
              label: "Team",
              children: (
                <div>
                  <SettingsSection title="Organization" description="Change a name and slug for your orgainzation">
                    <div className="flex justify-start">
                      <TeamSettingsEditor className="min-w-[500px]" currentSettings={pick(org, Object.keys(TeamSettings.shape))} buttonTitle={"Save"} size="middle" />
                    </div>

                  </SettingsSection>
                  <SettingsSection title="Access" description="Control who can access your organization">
                    <Suspense fallback={<Skeleton title={false} active paragraph={{rows: 3}} /> }>
                      <TeamAccessEditor orgId={} />
                    </Suspense>

                  </SettingsSection>

                </div>
              ),
            },
            { key: "billing", label: "Billing", children: <div>123123</div> },
          ]}
        />
      </PageContent>
    </div>
  );
};

export default SettingsPage;
