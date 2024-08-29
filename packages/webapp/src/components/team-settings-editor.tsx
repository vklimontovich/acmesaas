"use client";
import Button from "antd/es/button";
import Input from "antd/es/input";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrganizationSettings } from "@/lib/schema/workspace";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { CheckCircle, CircleX } from "lucide-react";
import type { SizeType } from "antd/es/config-provider/SizeContext";

export const OrganizationSettingsEditor: React.FC<{
  buttonTitle: string;
  currentSettings?: Partial<OrganizationSettings>;
  redirect?: boolean;
  size?: SizeType;
  className?: string;
}> = props => {
  const {size = "large"} = props;
  const params = useSearchParams();
  console.log("params", params);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>(params.has("success") ? "Organization settings saved" : undefined);

  const form = useForm<OrganizationSettings>({
    resolver: zodResolver(OrganizationSettings),
    defaultValues: props.currentSettings,
  });
  const router = useRouter();
  const onSubmit = async (values: OrganizationSettings) => {
    setLoading(true);
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    try {
      const result = await axios.post("/api/org", {
        ...values,
        id: props.currentSettings?.id
      });
      if (props.redirect) {
        router.push(`/${result.data.slug}`);
      } else {
        router.push(`/${result.data.slug}/settings?success=true`);

      }
    } catch (error: any) {
      console.error("Failed to edit org", error);
      setErrorMessage(error.response.data?.message || error.response.data?.error || error.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={clsx("flex items-center", props.className)}>
      <div className="mx-auto w-full space-y-8">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <div>
              <label className="font-bold text-sm" htmlFor="name">
                Organization Name
              </label>
              <Controller
                name="name"
                control={form.control}
                defaultValue=""
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <Input {...field} size={size} type="text" placeholder="my-company" className="mt-1 block w-full" />
                )}
              />
            </div>
            <div key="slug">
              <label className="font-bold text-sm mt-4" htmlFor="slug">
                Organization Slug
              </label>
              <Controller
                name="slug"
                control={form.control}
                defaultValue=""
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <Input {...field} size={size} type="text" placeholder="my-company" className="mt-1 block w-full" />
                )}
              />
            </div>
          </div>

          <div>
            <Button loading={loading} htmlType="submit" type="primary" className="w-full" size={size}>
              {props.buttonTitle}
            </Button>
            <div
              className={clsx(
                errorMessage || successMessage || Object.keys(form.formState.errors).length > 0
                  ? "visible"
                  : "invisible",
                "mt-1 min-h-2 mb-2"
              )}
            >
              {errorMessage && (
                <div className="text-color-error">
                  <CircleX className={"inline w-4 h-4"} /> {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="text-color-success">
                  <CheckCircle className={"inline w-4 h-4"} /> {successMessage}
                </div>
              )}
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="text-color-error text-sm flex flex-col gap-0.5">
                  {Object.entries(form.formState.errors).map(([key, value]) => (
                    <div key={key}>
                      {key}: {value.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
