import { ZodType } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export function nextRouteError(status: number, error: string | Error | object) {
  const body =
    typeof error === "string"
      ? { message: error }
      : error instanceof Error
        ? { message: error?.message || "Unknown error" }
        : error;
  return new NextResponse(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export function getOrigin() {
  const headersList = headers();

  // Check for X-Forwarded-Proto and X-Forwarded-Host headers
  const forwardedProto = headersList.get("x-forwarded-proto");
  const forwardedHost = headersList.get("x-forwarded-host");
  const forwardedPort = headersList.get("x-forwarded-port");

  // Use the forwarded values if present, otherwise fall back to the standard headers
  const protocol = forwardedProto || (process.env.NODE_ENV === "production" ? "https" : "http");
  const host = forwardedHost || headersList.get("host");

  // If there's a forwarded port, include it, otherwise the host may already include the port
  const port = forwardedPort && !host?.includes(":") ? `:${forwardedPort}` : "";

  return `${protocol}://${host}${port}`;
}

type NextJsRouteHandler = (req: NextRequest, res: NextResponse) => void | Response | Promise<void | Response>;

export function typedRoute<
  QueryZodType extends ZodType = never,
  BodyZodType extends ZodType = never,
  ResultZodType extends ZodType = any,
>(
  opts: { query?: QueryZodType; body?: BodyZodType; returns?: ResultZodType },
  callback: (opts: {
    query: QueryZodType extends ZodType<infer QueryType> ? QueryType : never;
    body: BodyZodType extends ZodType<infer BodyType> ? BodyType : never;
    req: NextRequest;
    res: NextResponse;
  }) => ResultZodType extends ZodType<infer ResultType> ? ResultType | Promise<ResultType> : void | Promise<void>
): NextJsRouteHandler {
  return async (req: NextRequest, res: NextResponse) => {
    let query = undefined;
    let body = undefined;
    if (opts.query) {
      const queryObject = Object.fromEntries(req.nextUrl.searchParams.entries());
      console.log(`Query object: ${JSON.stringify(queryObject)}`);
      const parseResult = opts.query.safeParse(queryObject);
      if (!parseResult.success) {
        console.error(`Error parsing query of ${req.method} ${req.nextUrl.pathname}: ${parseResult.error.message}`);
        return nextRouteError(400, {
          message: "Unable to parse query params",
          details: { zodErrors: parseResult.error },
        });
      }
      query = parseResult.data;
    }
    if (opts.body) {
      const bodyJson = await req.json();
      const parseResult = opts.body.safeParse(bodyJson);
      if (parseResult.error) {
        console.error(`Error parsing body of ${req.method} ${req.nextUrl.pathname}: ${parseResult.error.message}`);
        return nextRouteError(400, { message: "Unable to parse body", details: { zodErrors: parseResult.error } });
      }
      body = parseResult.data;
    } else if (req.body) {
      body = await req.json();
    }

    try {
      const result = await callback({ query: query as any, body: body as any, req, res });
      if (opts.returns) {
        const parseResult = opts.returns.safeParse(result);
        if (parseResult.error) {
          console.error(
            `Error post-processing result of ${req.method} ${req.nextUrl.pathname} - invalid type: ${parseResult.error.message}`
          );
          return nextRouteError(500, {
            message: "The route return invalid body",
            details: { zodErrors: parseResult.error },
          });
        }
        return NextResponse.json(parseResult.data);
      } else if ((result as any) instanceof NextResponse) {
        return result;
      } else if (!res.bodyUsed) {
        return NextResponse.json(result);
      }
    } catch (e: any) {
      console.error(`Error processing ${req.method} ${req.nextUrl.pathname}: ${e?.message || e}`, e);
      return nextRouteError(500, { message: e?.message || "Internal server error" });
    }
  };
}
