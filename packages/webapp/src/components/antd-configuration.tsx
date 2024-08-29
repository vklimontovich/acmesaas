"use client";

import React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";
import type Entity from "@ant-design/cssinjs/es/Cache";
import { ConfigProvider } from "antd";

const antdTheme = {
  token: {
    colorPrimary: "hsl(243, 57%, 40%)", // --color-primary
    // colorBgContainer: 'transparent',
    linkColor: "hsl(243, 57%, 40%)",
    colorBorder: "rgb(203, 213, 225)",
    Button: {
      primaryShadow: "none",
    },
    // colorPrimaryHover: 'hsl(243, 88%, 75%)', // --color-primary-light
    // colorPrimaryActive: 'hsl(244, 49%, 20%)', // --color-primary-dark
    // colorPrimaryDisabled: 'hsl(235, 88%, 83%)', // --color-primary-disabled,
    //
    // colorTextBase: 'hsl(216, 28%, 23%)', // --color-foreground
    // colorText: 'hsl(222, 86%, 5%)', // --color-foreground-dark
    // colorTextSecondary: 'hsl(215, 21%, 58%)', // --color-foreground-light
    // colorTextDisabled: 'hsl(213, 27%, 84%)', // --color-foreground-disabled
    //
    // colorBgBase: '#f8fafc', // --color-background
    // colorBgContainer: 'hsl(213, 27%, 84%)', // --color-background-dark
    // colorBgElevated: 'hsl(0, 0%, 100%)', // --color-background-light
    //
    // colorError: 'hsl(0, 74%, 57%)', // --color-foreground-error
    // colorSuccess: 'hsl(134, 61%, 48%)', // --color-foreground-success
    // colorWarning: 'hsl(24, 73%, 49%)', // --color-foreground-warning
  },
};

const StyledComponentsRegistry = ({ children }: React.PropsWithChildren) => {
  const cache = React.useMemo<Entity>(() => createCache(), []);
  const isServerInserted = React.useRef<boolean>(false);
  useServerInsertedHTML(() => {
    // avoid duplicate css insert
    // if (isServerInserted.current) {
    //   return;
    // }
    // isServerInserted.current = true;
    return <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />;
  });
  return (
    <StyleProvider cache={cache}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </StyleProvider>
  );
};

export default StyledComponentsRegistry;
