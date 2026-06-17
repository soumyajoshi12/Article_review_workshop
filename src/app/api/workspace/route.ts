import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  const organizations =
    await db.organization.findMany({
      include: {
        projects: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  return NextResponse.json(
    organizations,
  );
}