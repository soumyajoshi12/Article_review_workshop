import { NextResponse } from "next/server";
import type { ArticleStatus } from "../../../../../../generated/prisma";
import { db } from "~/server/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const { status } = body as {
      status: ArticleStatus;
    };

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }

    const updated = await db.article.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update status" },
      { status: 500 }
    );
  }
}