import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is required." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const record = await prisma.parentPasscode.findUnique({
            where: { parentEmail: normalizedEmail }
        });

        // A passcode is set if a record exists and it contains a passcode string
        const hasPasscode = !!(record && record.passcode);

        return NextResponse.json({ success: true, hasPasscode });
    } catch (error) {
        console.error("check-passcode error:", error);
        const errMsg = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
