import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/s3";

export async function GET(request: NextRequest) {
    try {
        const adminPasscode = request.headers.get("x-admin-passcode")?.trim();

        if (!adminPasscode) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Administrator credentials are required." },
                { status: 401 }
            );
        }

        const adminUser = await prisma.adminUser.findFirst({
            where: { password: adminPasscode }
        });

        if (!adminUser) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Invalid administrator passcode." },
                { status: 403 }
            );
        }

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
