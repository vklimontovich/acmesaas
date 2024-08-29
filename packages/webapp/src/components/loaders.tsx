import clsx from "clsx";
import { useState } from "react";
import { Skeleton } from "antd";

export function Loader({ className }: { className?: string }) {
  return (
    <div className={clsx(className, "flex w-full h-full justify-center items-center dark:invert gap-3")}>
      <span className="sr-only">Loading...</span>
      <div className="h-8 w-8 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-8 w-8 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-8 w-8 bg-primary rounded-full animate-bounce"></div>
    </div>
  );
}

export function Loaders({ delayMs = 200 }) {
  const [visible, setVisible] = useState(true);
  //avoid flickering
  // useEffect(() => {
  //   if (delayMs) {
  //     const timeoutId = setTimeout(() => setVisible(true), delayMs);
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [delayMs]);
  return (
    <div className="w-screen h-screen ">
      <Loader className={visible ? "visible" : "invisible"} />
    </div>
  );
}

export const PageContentLoader = () => {
  return (
    <div className="w-full h-full">
      <Skeleton active paragraph={{ rows: 1, width: "100%" }} title={false} className="pt-4" />
      <Skeleton active paragraph={{ rows: 8, width: "100%" }} title={false} className="pt-12" />
    </div>
  );
};
