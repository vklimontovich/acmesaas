"use client";

import { Button } from "antd";
import { GithubOutlined, GoogleOutlined } from "@ant-design/icons";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { capitalize } from "lodash";
import { useParams, useRouter } from "next/navigation";

export const AuthButton: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  return (
    <Button
      type="default"
      loading={loading}
      block
      size="large"
      className={className}
      icon={type === "google" ? <GoogleOutlined /> : <GithubOutlined />}
      onClick={async () => {
        setLoading(true);
        try {
          await signIn(type);
          if (params.redirect) {
            await router.push(params.redirect as string);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }}
    >
      Continue with {capitalize(type)}
    </Button>
  );
};
