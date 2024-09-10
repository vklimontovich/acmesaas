import { ZodType } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireDefined } from "@/lib/shared/preconditions";
import { stringifyZodError } from "@/lib/shared/zod-utils";

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

type NextJsRouteHandler = (
  req: NextRequest,
  context: {
    params: { id: string };
    searchParams: URLSearchParams;
    previewData?: any;
    cookies: any;
  }
) => void | Response | Promise<void | Response>;

export function typedRoute<
  QueryZodType extends ZodType = never,
  BodyZodType extends ZodType = never,
  ResultZodType extends ZodType = any,
>(
  opts: {
    query?: QueryZodType;
    body?: BodyZodType;
    returns?: ResultZodType;
    bodyParser?: (req: NextRequest) => Promise<any> | any;
  },
  callback: (opts: {
    query: QueryZodType extends ZodType<infer QueryType> ? QueryType : any;
    body: BodyZodType extends ZodType<infer BodyType> ? BodyType : never;

    req: NextRequest;
  }) => ResultZodType extends ZodType<infer ResultType> ? ResultType | Promise<ResultType> : void | Promise<void>
): NextJsRouteHandler {
  return async (req: NextRequest, { params }) => {
    let query = undefined;
    let body = undefined;
    if (opts.query) {
      const queryObject = Object.fromEntries([...req.nextUrl.searchParams.entries(), ...Object.entries(params || [])]);
      const parseResult = opts.query.safeParse(queryObject);
      if (!parseResult.success) {
        console.error(
          `Error parsing query of ${req.method} ${req.nextUrl.pathname}. ${stringifyZodError(parseResult.error, { prefix: "Details:" })}\n. Result: ${JSON.stringify(queryObject)}`
        );
        return nextRouteError(400, {
          message: `Unable to parse query params: ?${Object.keys(queryObject)
            .map(k => `${k}=${queryObject[k]}`)
            .join("& ")}`,
          details: { zodErrors: parseResult.error },
        });
      }
      query = parseResult.data;
    } else {
      query = Object.fromEntries(req.nextUrl.searchParams.entries());
    }
    if (opts.body) {
      const bodyStr = opts.bodyParser ? await opts.bodyParser(req) : await req.json();
      const parseResult = opts.body.safeParse(bodyStr);
      if (parseResult.error) {
        console.error(
          `Error parsing body of ${req.method} ${req.nextUrl.pathname}. ${stringifyZodError(parseResult.error, { prefix: "Details:" })}\n. Result: ${JSON.stringify(bodyStr)}`
        );
        return nextRouteError(400, { message: "Unable to parse body", details: { zodErrors: parseResult.error } });
      }
      body = parseResult.data;
    } else if (req.body) {
      if (opts.bodyParser) {
        body = await opts.bodyParser(req);
      } else {
        const bodyString = await req.text();
        if (bodyString) {
          try {
            body = JSON.parse(bodyString);
          } catch (e) {
            console.error(`Body of ${req.method} ${req.nextUrl.pathname} is not a JSON object: ${bodyString}`, e);
            return nextRouteError(400, { message: "Unable to parse body", details: { error: e } });
          }
        } else {
          body = undefined;
        }
      }
    }

    try {
      const result = await callback({ query: query as any, body: body as any, req });
      if (opts.returns) {
        const parseResult = opts.returns.safeParse(result);
        if (parseResult.error) {
          console.error(
            `Error parsing result of ${req.method} ${req.nextUrl.pathname}. ${stringifyZodError(parseResult.error, { prefix: "Details:" })}\n. Result: ${JSON.stringify(result)}`
          );

          return nextRouteError(500, {
            message: "The route return invalid body",
            details: { zodErrors: parseResult.error },
          });
        }
        return NextResponse.json(parseResult.data);
      } else if ((result as any) instanceof NextResponse) {
        return result;
      } else if (!req.bodyUsed) {
        return NextResponse.json(result || { ok: true });
      }
    } catch (e: any) {
      console.error(`Error processing ${req.method} ${req.nextUrl.pathname}: ${e?.message || e}`, e);
      return nextRouteError(500, { message: e?.message || "Internal server error" });
    }
  };
}

type LooseResult<T> = Promise<T | undefined> | T | undefined;

type InferTypeFromZod<QueryZodType extends ZodType = never> =
  QueryZodType extends ZodType<infer QueryType> ? QueryType : never;

export function objectEditRoute<ObjectZodType extends ZodType, ReturnType, QueryZodType extends ZodType = never>(opts: {
  objectType: ObjectZodType;
  query: QueryZodType;
  get: (opts: {
    query: InferTypeFromZod<QueryZodType>;
    rawQuery: Record<string, any>;
  }) => LooseResult<InferTypeFromZod<ObjectZodType>>;
  del?: (opts: { query: InferTypeFromZod<QueryZodType>; rawQuery: Record<string, any> }) => LooseResult<void>;
  list?: (opts: {
    query: InferTypeFromZod<QueryZodType>;
  }) => Promise<InferTypeFromZod<ObjectZodType>[]> | InferTypeFromZod<ObjectZodType>[];
  upsert: (opts: {
    query: InferTypeFromZod<QueryZodType>;
    rawQuery: Record<string, any>;
    body: InferTypeFromZod<ObjectZodType>;
  }) => Promise<ReturnType | undefined> | ReturnType | undefined;
}) {
  return typedRoute({}, async ({ body, req }) => {
    const rawQuery = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = opts.query.parse(rawQuery);

    if (req.method === "GET") {
      if (rawQuery.op === "list") {
        return requireDefined(opts.list, `listing is not supported`)({ query });
      }
      const result = await opts.get({ query, rawQuery });
      if (!result) {
        return new Response(null, {
          status: 204,
        });
      }
      return opts.objectType.parse(result);
    } else if (req.method === "DELETE") {
      return requireDefined(opts.del, `DELETE is not supported`)({ query, rawQuery });
    } else if (req.method === "POST" || req.method === "PUT") {
      const obj = opts.objectType.parse(body);
      const result = await opts.upsert({ query, rawQuery, body: obj });
      //upsert should return an upserted object, eg object with id. Otherwise,
      //we just return the object we got. Consumer (form) expects the object back
      //to rerender the form
      return result || obj;
    }
  });
}
