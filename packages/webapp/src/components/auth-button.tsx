"use client";

import { Button } from "antd";
import { GithubOutlined, GoogleOutlined } from "@ant-design/icons";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { capitalize } from "lodash";

export const AuthButton: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="default"
      block
      size="large"
      className={className}
      icon={type === "google" ? <GoogleOutlined /> : <GithubOutlined />}
      onClick={async () => {
        setLoading(true);
        try {
          await signIn(type);
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
