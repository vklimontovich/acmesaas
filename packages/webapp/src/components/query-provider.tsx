"use client";

import { PropsWithChildren } from "react";
import { ZodType } from "zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export type Endpoint = string | [string, Record<string, any>];

function parseRelativeUrl(url: string): [string, Record<string, any>] {
  const [path, query] = url.split("?");
  if (!query) {
    return [path, {}];
  }
  return [path, Object.fromEntries(new URLSearchParams(query).entries())];
}

export function stringifyEndpoint(endpoint: Endpoint): string {
  if (typeof endpoint === "string") {
    return endpoint;
  }
  const [path, query] = endpoint;
  if (!query) {
    return path;
  }
  const [pathClean, queryClean] = parseRelativeUrl(path);
  const filteredQuery = {
    ...Object.fromEntries(Object.entries(query).filter(([_, val]) => val !== undefined)),
    ...queryClean,
  };
  if (Object.keys(filteredQuery).length === 0) {
    return path;
  }

  return `${pathClean}?${new URLSearchParams(filteredQuery).toString()}`;
}

export function zodFetcher<Z extends ZodType>(
  returns: Z,
  opts: { delayMs?: number } = {}
): (endpoint: any) => Promise<Z extends ZodType<infer T> ? T : never> {
  return async ({ queryKey, signal }) => {
    if (opts.delayMs) {
      await new Promise(resolve => setTimeout(resolve, opts.delayMs));
    }
    const url = stringifyEndpoint(queryKey);
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText} `);
    }
    const bodyStr = await response.text();
    let bodyJson;
    try {
      bodyJson = JSON.parse(bodyStr);
    } catch (e: any) {
      throw new Error(`Failed to parse response as JSON from ${url}: ${e.message || "unknown error"}`, e);
    }
    return returns.parse(bodyJson);
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchOnReconnect: false,
      retry: false,
      refetchOnMount: true,
    },
  },
});

export const QueryProvider = ({ children }: PropsWithChildren) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
