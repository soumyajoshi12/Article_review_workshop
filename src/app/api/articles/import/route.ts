import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { ArticleStatus } from "../../../../../generated/prisma";

type ArticleInput = {
    Title?: string;
    PMID?: string;
    DOI?: string;
};

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { projectId, articles } = body as {
            projectId: string;
            articles: ArticleInput[];
        };

        if (!projectId || !articles?.length) {
            return NextResponse.json(
                { message: "Missing projectId or articles" },
                { status: 400 }
            );
        }

        const formattedArticles = articles.map((item) => ({
            title: item.Title ?? "",
            pmid: item.PMID ?? "",
            doi: item.DOI ?? "",
            status: ArticleStatus.MAYBE,
            projectId,
        }));

        await db.article.createMany({
            data: formattedArticles,
            skipDuplicates: true, 
        });

        return NextResponse.json({
            message: "Articles imported successfully",
            count: formattedArticles.length,
        });
    } catch (error) {
        console.error("Import Error:", error);

        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}