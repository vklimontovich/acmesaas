import { NextRequest, NextResponse } from "next/server";
import { ZodType } from "zod";
import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { requireDefined } from "@/lib/shared/preconditions";
import { prisma } from "@/lib/server/prisma";
import { TeamSettings } from "@/lib/schema/workspace";
import { nanoid } from "nanoid";

export function nextRouteError(status: number, error: string | Error | object) {
  const body =
    typeof error === "string"
      ? { message: error }
      : error instanceof Error
        ? { message: error?.message || "Unknown error" }
        : error;
  return new NextResponse(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export function withType<
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
) {
  return async (req: NextRequest, res: NextResponse) => {
    let query = undefined;
    let body = undefined;
    if (opts.query) {
      req.nextUrl.searchParams;
      const parseResult = opts.query.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
      if (parseResult.success) {
        return nextRouteError(400, {
          message: "Unable to parse query params",
          details: { zodErrors: parseResult.error },
        });
      }
      query = parseResult.data;
    }
    if (opts.body) {
      const bodyJson = await req.json();
      console.log("parseResult", bodyJson);
      const parseResult = opts.body.safeParse(bodyJson);
      if (parseResult.error) {
        return nextRouteError(400, { message: "Unable to parse body", details: { zodErrors: parseResult.error } });
      }
      body = parseResult.data;
    }

    try {
      const result = await callback({ query: query as any, body: body as any, req, res });
      if (opts.returns) {
        const parseResult = opts.returns.safeParse(result);
        if (parseResult.error) {
          return nextRouteError(500, {
            message: "The route return invalid body",
            details: { zodErrors: parseResult.error },
          });
        }
        return NextResponse.json(parseResult.data);
      } else if (!res.bodyUsed) {
        return NextResponse.json(result);
      }
    } catch (e: any) {
      console.error(e);
      return nextRouteError(500, { message: e?.message || "Internal server error" });
    }
  };
}

export const POST = withType(
  {
    body: TeamSettings,
    returns: TeamSettings.required(),
  },
  async ({ body }) => {
    const user = requireDefined(await getUser());
    if (!body.id && (await prisma.team.count({ where: { slug: requireDefined(body.slug) } })) != 0) {
      throw new Error(`Team with this slug ${body.slug} already exists. Please pick another slug`);
    }
    const exstingTeam = body.id
      ? requireDefined(
          await prisma.team.findFirst({ where: { id: body.id, deletedAt: null } }),
          `Team ${body.id} not found`
        )
      : undefined;
    if (exstingTeam) {
      await verifyTeamAccess(user, exstingTeam.id);
      return prisma.team.update({
        where: { id: exstingTeam.id },
        data: {
          name: body.name,
          slug: body.slug,
        },
      });
    } else {
      return prisma.team.create({
        data: {
          id: `team_${nanoid()}`,
          name: body.name,
          slug: body.slug,
          memberships: {
            create: {
              role: "owner",
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          },
        },
      });
    }
  }
);
