import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

// Hash utility function using native Node.js crypto (SHA-256 with HMAC)
export function hashPasscode(passcode: string): string {
    const salt = "parents_pickup_academy_salt_2026";
    return crypto.createHmac("sha256", salt).update(passcode).digest("hex");
}

export async function POST(request: NextRequest) {
    try {
        const { email, otp, passcode } = await request.json();

        if (!email || !otp || !passcode) {
            return NextResponse.json(
                { success: false, error: "Email, OTP, and new passcode are required." },
                { status: 400 }
            );
        }

        if (!/^\d{6}$/.test(passcode)) {
            return NextResponse.json(
                { success: false, error: "Passcode must be a 6-digit number." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const record = await prisma.parentPasscode.findUnique({
            where: { parentEmail: normalizedEmail }
        });

        if (!record || !record.otp) {
            return NextResponse.json(
                { success: false, error: "No pending OTP request found for this email." },
                { status: 400 }
            );
        }

        // Check if OTP is expired
        if (record.otpExpiry && new Date() > record.otpExpiry) {
            return NextResponse.json(
                { success: false, error: "OTP has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Verify OTP match
        if (record.otp !== otp.trim()) {
            return NextResponse.json(
                { success: false, error: "Invalid OTP code." },
                { status: 400 }
            );
        }

        // Hash and save passcode, clear OTP fields
        await prisma.parentPasscode.update({
            where: { parentEmail: normalizedEmail },
            data: {
                passcode: hashPasscode(passcode),
                otp: null,
                otpExpiry: null
            }
        });

        return NextResponse.json({
            success: true,
            message: "Passcode set successfully. You can now log in/check in."
        });
    } catch (error) {
        console.error("verify-otp-set-passcode error:", error);
        const errMsg = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
