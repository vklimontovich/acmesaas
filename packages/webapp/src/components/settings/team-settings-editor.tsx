"use client";
import { TeamSettings } from "@/lib/schema/team-settings";
import clsx from "clsx";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import { ObjectEditorForm } from "@/components/form/object-editor-form";
import { Input } from "antd";
import { brand } from "@/lib/content/branding";

export const TeamSettingsEditor: React.FC<{
  buttonTitle: string;
  currentSettings?: Partial<TeamSettings>;
  redirect?: boolean;
  size?: SizeType;
  className?: string;
}> = props => {
  const { size = "large" } = props;
  return (
    <div className={clsx("flex items-center", props.className)}>
      <ObjectEditorForm
        apiEndpoint={["/api/team", { teamId: props?.currentSettings?.id }]}
        valuesType={TeamSettings}
        onSuccess={props.redirect ? () => window.location.reload() : undefined}
        className="min-w-[500px]"
        size={size}
        ui={{
          fields: {
            id: {
              hidden: true,
            },
            slug: {
              render: ({ field, size }) => <Input {...field} size={size} addonBefore={`${brand.appDomain}/`} />,
            },
          },
        }}
      />
    </div>
  );
};
