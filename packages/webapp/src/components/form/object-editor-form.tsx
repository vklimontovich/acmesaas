"use client";

import { ZodObject, ZodType } from "zod";
import { Controller, useForm } from "react-hook-form";
import { TeamSettings } from "@/lib/schema/team-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Button, Skeleton } from "antd";
import { CheckCircle, CircleX, Info } from "lucide-react";
import Input from "antd/es/input";
import { capitalize } from "lodash";
import clsx from "clsx";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import { InlineError } from "@/components/errors/inline-error";
import { Endpoint, stringifyEndpoint } from "@/components/query-provider";
import Password from "antd/es/input/Password";

export type FormFieldProps = {
  label: string;
  placeholder: string;
  description?: string;
  hidden?: boolean;
  password?: true;
  render?: (param: { size: SizeType; field: any }) => ReactNode;
};

function getFormFieldProps(key: string, props?: Partial<FormFieldProps>): FormFieldProps {
  return {
    label: capitalize(key),
    placeholder: capitalize(key),
    ...(props || {}),
  };
}

function getType(field: any) {
  while (field._def.typeName === "ZodOptional") {
    field = field._def.innerType;
  }
  return field._def.typeName;
}

export function ObjectEditorForm<ObjectZodType extends ZodType>(props: {
  //base API endpoint. POST will be used to create new objects, PUT to update existing objects
  //get to get the initial values
  apiEndpoint: Endpoint;
  newObj?: ObjectZodType extends ZodType<infer T> ? T : never;
  //Zod type values
  valuesType: ObjectZodType;
  className?: string;
  size?: SizeType;
  buttonTitle?: React.ReactNode;
  onSuccess?: (values: ObjectZodType extends ZodType<infer BodyType> ? BodyType : never) => Promise<void> | void;
  ui?: {
    fields?: Partial<
      Record<ObjectZodType extends ZodType<infer BodyType> ? keyof BodyType : never, Partial<FormFieldProps>>
    >;
  };
}) {
  const [formLoading, setFormLoading] = useState(!props.newObj);
  const [formLoadingError, setFormLoadingError] = useState<any>();
  const [formGlobalError, setFormGlobalError] = useState<string>();
  const zodType = props.valuesType as any as ZodObject<any>;
  if (!zodType.shape) {
    const msg = `The provided type doesn't have a .shape`;
    console.error(msg, zodType);
    throw new Error(msg);
  }
  const [successMessage, setSuccessMessage] = useState<string>();
  const form = useForm({
    resolver: zodResolver(zodType),
  });
  const url = stringifyEndpoint(props.apiEndpoint);
  const onSuccess = props.onSuccess;
  const onSubmit = useCallback(
    async (values: any) => {
      try {
        setFormGlobalError(undefined);
        setSuccessMessage(undefined);
        const newValues = await axios.post(url, values);
        if (onSuccess) {
          await onSuccess(newValues.data);
        } else {
          setSuccessMessage("Saved successfully");
        }
        if (newValues) {
          form.reset(newValues.data);
        }
      } catch (e: any) {
        setFormGlobalError(e.response.data?.message || e.response.data?.error || e.message || "Unknown error");
        console.error(`Failed to save data to ${url}`, e);
      }
    },
    [form, onSuccess, url]
  );

  useEffect(() => {
    if (props.newObj) {
      form.reset(props.newObj);
      return;
    }
    const controller = new AbortController();
    axios
      .get(url, { signal: controller.signal })
      .then(res => {
        form.reset(res.data);
      })
      .catch(e => {
        if (!controller.signal.aborted) {
          console.error(`Failed to load data from ${url}`, e);
          setFormLoadingError(e);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setFormLoading(false);
        }
      });
    return () => controller.abort();
  }, [form, props.newObj, url]);

  if (formLoading) {
    return <Skeleton title={false} active paragraph={{ rows: 3, width: "100%" }} />;
  } else if (formLoadingError) {
    return <InlineError error={formLoadingError.message} title="Error loading form" />;
  }

  const formSubmitHandler = form.handleSubmit(onSubmit);
  return (
    <form className={clsx("gap-2 flex flex-col", props.className)} onSubmit={formSubmitHandler}>
      {Object.keys(zodType.shape).map(key => {
        const field = zodType.shape[key];
        const type = getType(field);
        const fieldUI = getFormFieldProps(key, (props.ui?.fields as any)?.[key]);

        const fieldError = form.formState.errors[key];
        const fieldErrorMessage = fieldError?.message;
        return (
          <div key={key}>
            {!fieldUI.hidden && (
              <label htmlFor={key} className="text-foreground/70 font-medium pb-0.5 block">
                {fieldUI.label}
              </label>
            )}
            <Controller
              name={key as any}
              control={form.control}
              render={
                ((args: any) => {
                  if (fieldUI.render) {
                    return fieldUI.render({ size: props.size, field: args.field });
                  }
                  if (fieldUI.hidden) {
                    return <Input {...args.field} type="hidden" />;
                  }
                  if (type === "ZodString") {
                    const Component = fieldUI.password ? Password : Input;
                    return (
                      <Component
                        autoComplete="off"
                        {...args.field}
                        size={props.size}
                        status={fieldErrorMessage ? "error" : undefined}
                        placeholder={fieldUI.placeholder}
                      />
                    );
                  } else {
                    return (
                      <div>
                        Unsupported type {type}: {JSON.stringify(field)}
                      </div>
                    );
                  }
                }) as any
              }
            />
            {!fieldUI.hidden && fieldErrorMessage && (
              <div className="text-foreground-error flex items-center text-sm gap-1 mt-0.5">
                <Info className="w-4 h-4" />
                {fieldErrorMessage + ""}
              </div>
            )}
          </div>
        );
      })}
      <Button
        type="primary"
        className="mt-4"
        htmlType={"submit"}
        size={props.size}
        loading={form.formState.isSubmitting}
      >
        {props.buttonTitle || "Save"}
      </Button>
      {formGlobalError && (
        <div className="text-foreground-error flex items-center text-sm gap-1 mt-0.5">
          <Info className="w-4 h-4" />
          {formGlobalError}
        </div>
      )}
      {successMessage && (
        <div className="text-foreground-success flex items-center text-sm gap-1 mt-0.5">
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </div>
      )}
    </form>
  );
}
