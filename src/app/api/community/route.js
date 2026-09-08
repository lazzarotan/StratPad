import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const currentUserId = session?.user?.id;

  const { searchParams } = new URL(req.url);

  const title = (searchParams.get("title") || "").trim();
  const author = (searchParams.get("author") || "").trim();

  const tagIds = (searchParams.get("tagIds") || "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));

  const sort = searchParams.get("sort") || "newest";

  const PAGE_SIZE = 15;

  const pageRaw = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(pageRaw) ? Math.max(pageRaw, 1) : 1;
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    isPublic: true,

    ...(currentUserId ? {
          ownerId: {
            not: currentUserId,
          },
        }
      : {}),

    ...(title ? {
          title: { contains: title, mode: "insensitive" },
        }
      : {}),

    ...(author ? {
          owner: {
            username: { contains: author, mode: "insensitive" },
          },
        }
      : {}),

    ...(tagIds.length ? {
          dashboardTags: {
            some: { tagId: { in: tagIds } },
          },
        }
      : {}),
  };

  try {
    const orderByMap = {
      newest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      mostCloned: { copies: { _count: "desc" } },
    };
    const orderBy = orderByMap[sort] || orderByMap.newest;

    const [total, dashboards] = await prisma.$transaction([
      prisma.dashboard.count({ where }),
      prisma.dashboard.findMany({
        where,
        orderBy,
        take: PAGE_SIZE,
        skip,
        select: {
          dashboardId: true,
          title: true,
          description: true,
          createdAt: true,
          owner: { select: { username: true } },
          dashboardTags: {
            select: { tag: { select: { tagId: true, name: true } } },
          },
          _count: { select: { copies: true } },
        },
      }),
    ]);

    const result = dashboards.map((d) => ({
      dashboardId: d.dashboardId,
      title: d.title,
      description: d.description,
      createdAt: d.createdAt,
      owner: d.owner,
      tags: d.dashboardTags.map((dt) => dt.tag),
      cloneCount: d._count.copies,
    }));

    return NextResponse.json({ dashboards: result, total, page, pageSize: PAGE_SIZE });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch public dashboards." },
      { status: 500 }
    );
  }
}