import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { passcode } = await request.json();

        if (!passcode) {
            return NextResponse.json(
                { success: false, error: "Passcode is required." },
                { status: 400 }
            );
        }

        // Search the AdminUser table for any administrator with this passcode
        const admin = await prisma.adminUser.findFirst({
            where: {
                password: passcode.trim()
            }
        });

        if (!admin) {
            return NextResponse.json(
                { success: false, error: "Incorrect admin passcode." },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Admin passcode verified successfully."
        });
    } catch (error) {
        console.error("verify-admin error:", error);
        const errMsg = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
