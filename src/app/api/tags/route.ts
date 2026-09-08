import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        tagId: true,
        name: true,
      },
    });

    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tags." },
      { status: 500 }
    );
  }
}