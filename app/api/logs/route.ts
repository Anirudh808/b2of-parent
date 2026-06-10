import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/s3";

export async function GET() {
    try {
        // Fetch logs and sort by newest first
        const logs = await prisma.checkInOutLog.findMany({
            orderBy: {
                timestamp: "desc",
            },
        });

        const logsWithPresignedUrls = await Promise.all(
            logs.map(async (log) => ({
                ...log,
                photoUrl: await getPresignedUrl(log.photoUrl)
            }))
        );

        return NextResponse.json({ success: true, data: logsWithPresignedUrls });
    } catch (error) {
        console.error("GET /api/logs error:", error);
        const errMsg = error instanceof Error ? error.message : "Failed to fetch logs";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
