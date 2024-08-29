import { prisma } from "@/lib/server/prisma";

export async function pickSlug(gen: () => string) {
  let slug: string;
  do {
    slug = gen();
  } while ((await prisma.team.count({ where: { slug } })) > 0);
}
