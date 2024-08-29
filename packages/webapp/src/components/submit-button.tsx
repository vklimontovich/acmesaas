"use client";
import { Button } from "antd";
import { Simplify } from "type-fest";
import { useState } from "react";

export type ButtonProps = Simplify<Omit<React.ComponentProps<typeof Button>, "onClick" | "loading">>;
export const SumbitButton: React.FC<ButtonProps> = props => {
  const [loading, setLoading] = useState(false);
  return <Button {...props} onClick={() => setLoading(true)} loading={loading} />;
};
