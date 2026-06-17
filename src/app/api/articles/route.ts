import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "ALL";
    const sortBy = searchParams.get("sortBy") ?? "importedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    if (!projectId) {
      return NextResponse.json(
        { message: "projectId is required" },
        { status: 400 }
      );
    }

    // Restrict sortable fields to known values
    const allowedSortFields = ["title", "pmid", "doi", "importedAt"] as const;
    const orderField = allowedSortFields.includes(
      sortBy as (typeof allowedSortFields)[number]
    )
      ? sortBy
      : "importedAt";

    const articles = await db.article.findMany({
      where: {
        projectId,

        ...(status !== "ALL" && {
          status: status as "INCLUDED" | "EXCLUDED" | "MAYBE",
        }),

        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  pmid: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  doi: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: {
        [orderField]: sortOrder,
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);

    return NextResponse.json(
      { message: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}