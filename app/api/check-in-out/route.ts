import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { uploadImage, getPresignedUrl } from "@/lib/s3";
import { hashPasscode } from "../auth/verify-otp-set-passcode/route";

export async function POST(request: NextRequest) {
    try {
        const { kidId, email, passcode, photo } = await request.json();

        // 1. Basic validation
        if (!kidId || !email || !passcode) {
            return NextResponse.json(
                { success: false, error: "Kid ID, Email, and Passcode are required." },
                { status: 400 }
            );
        }

        if (!photo) {
            return NextResponse.json(
                { success: false, error: "Webcam photo evidence is required for check-in/out." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 2. Validate passcode
        const passcodeRecord = await prisma.parentPasscode.findUnique({
            where: { parentEmail: normalizedEmail }
        });
        if (!passcodeRecord || !passcodeRecord.passcode) {
            return NextResponse.json(
                { success: false, error: "No passcode set for this email address." },
                { status: 400 }
            );
        }

        if (passcodeRecord.passcode !== hashPasscode(passcode)) {
            return NextResponse.json(
                { success: false, error: "Incorrect passcode." },
                { status: 401 }
            );
        }

        // 3. Find the kid's profile
        const kid = await prisma.kid.findUnique({
            where: { id: kidId }
        });
        if (!kid) {
            return NextResponse.json(
                { success: false, error: "Kid profile not found." },
                { status: 404 }
            );
        }

        // Verify that this email is actually the parent's email for this kid
        if (kid.parentEmail.toLowerCase() !== normalizedEmail) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. The passcode email does not match the child's registered parent email." },
                { status: 403 }
            );
        }

        // Determine action type
        const actionType = kid.checkedIn ? "checkout" : "checkin";

        // 4. Upload photo evidence using s3/local helper
        const filename = `${kid.firstName}_${kid.lastName}_${actionType}.jpg`;
        let photoUrl = "";
        try {
            photoUrl = await uploadImage(photo, filename);
        } catch (uploadError) {
            console.error("Image upload failed:", uploadError);
            const uploadErrMsg = uploadError instanceof Error ? uploadError.message : "Failed to process photo upload.";
            return NextResponse.json(
                { success: false, error: uploadErrMsg },
                { status: 500 }
            );
        }

        // 5. Update kid status and log transaction atomically
        const [updatedKid, log] = await prisma.$transaction([
            prisma.kid.update({
                where: { id: kidId },
                data: {
                    checkedIn: !kid.checkedIn,
                    lastStatusChange: new Date()
                }
            }),
            prisma.checkInOutLog.create({
                data: {
                    kidId: kid.id,
                    kidName: `${kid.firstName} ${kid.lastName}`,
                    parentEmail: normalizedEmail,
                    parentName: kid.parentName,
                    type: actionType,
                    timestamp: new Date(),
                    photoUrl
                }
            })
        ]);

        const presignedPhotoUrl = await getPresignedUrl(photoUrl);
        const logWithPresignedUrl = {
            ...log,
            photoUrl: presignedPhotoUrl
        };

        return NextResponse.json({
            success: true,
            message: `Successfully ${actionType === "checkin" ? "checked in" : "checked out"} ${kid.firstName}!`,
            data: {
                kid: updatedKid,
                log: logWithPresignedUrl
            }
        });
    } catch (error) {
        console.error("check-in-out error:", error);
        const errMsg = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
