import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { notes } = await req.json();

    const article = await db.article.update({
      where: { id },
      data: {
        notes,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to save notes" },
      { status: 500 }
    );
  }
}