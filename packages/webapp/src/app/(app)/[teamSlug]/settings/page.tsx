"use client";
import { PageContent, PageHeader } from "@/components/page-header";
import { ReactNode } from "react";
import { notification, Tabs } from "antd";
import { BillingSettingsTab } from "@/components/settings/billing-settings-tab";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTeamPageContext } from "@/components/team-page";
import {  TeamSettings } from "@/lib/schema/team-settings";
import { ObjectEditorForm } from "@/components/form/object-editor-form";
import { TeamAccessEditor } from "@/components/team-access-editor";
import { brand } from "@/lib/content/branding";


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

const useSearchParamUpdater: (() => {
  updateSearchParam: (name: string, val: any) => void
}) = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  return {
    updateSearchParam: (name, val) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, val + "");
      router.replace(`${pathname}?${params.toString()}`);
    },
  };
};

export default function SettingsPage() {
  const { updateSearchParam } = useSearchParamUpdater();
  const searchParams = useSearchParams();
  const selectedSection = (searchParams.get("section") || "team") as string;
  const { user, team } = useTeamPageContext();
  return (
    <div>
      <PageHeader description={"Configure your team"}>Settings</PageHeader>
      <PageContent>
        <Tabs
          defaultActiveKey={selectedSection}
          onChange={(key) => updateSearchParam("section", key)}
          items={[
            {
              key: "team",
              label: "Team",
              children: (
                <div>
                  <SettingsSection title="General" description="Change a name and slug for your team">
                    <div className="flex justify-start">
                      <ObjectEditorForm
                        apiEndpoint={["/api/team", { teamId: team.id }]}
                        valuesType={TeamSettings}
                        className="min-w-[500px]"
                        onSuccess={(val) => {
                          notification.success({ message: "Settings saved" });
                          if (val.slug !== team.slug) {
                            window.history.replaceState({}, "", `/${val.slug}/settings`);
                            window.location.reload();
                          }
                          window.history.replaceState({}, "", `/${val.slug}/settings`);
                        }}
                        size="middle"
                        ui={{
                          fields: {
                            id: { hidden: true },
                          },
                        }}
                      />
                    </div>
                  </SettingsSection>
                  <SettingsSection title="Access" description="Control who can access your team">
                    <TeamAccessEditor />
                  </SettingsSection>
                </div>
              ),
            },
            {
              key: "billing",
              label: "Billing",
              children: (
                <BillingSettingsTab />
              ),
            }
          ]}
        />
      </PageContent>
    </div>
  );
};
