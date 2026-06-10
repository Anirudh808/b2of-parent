import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPasscode } from "../verify-otp-set-passcode/route";

export async function POST(request: NextRequest) {
    try {
        const { email, passcode } = await request.json();

        if (!email || !passcode) {
            return NextResponse.json(
                { success: false, error: "Email and passcode are required." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const record = await prisma.parentPasscode.findUnique({
            where: { parentEmail: normalizedEmail }
        });

        if (!record || !record.passcode) {
            return NextResponse.json(
                { success: false, error: "No passcode set for this email address." },
                { status: 400 }
            );
        }

        // Verify if the input passcode matches the stored hash
        const hashedInput = hashPasscode(passcode);
        if (record.passcode !== hashedInput) {
            return NextResponse.json(
                { success: false, error: "Incorrect passcode." },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Passcode verified successfully."
        });
    } catch (error) {
        console.error("verify-passcode error:", error);
        const errMsg = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
