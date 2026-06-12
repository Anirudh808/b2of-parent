import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPasscode } from "@/app/api/auth/verify-otp-set-passcode/route";

// Helper function to verify authorization
async function verifyAccess(request: NextRequest, parentEmail: string) {
    const adminPasscode = request.headers.get("x-admin-passcode")?.trim();
    const parentPasscode = request.headers.get("x-parent-passcode")?.trim();

    // 1. Check if administrator
    if (adminPasscode) {
        const adminUser = await prisma.adminUser.findFirst({
            where: { password: adminPasscode }
        });
        if (adminUser) {
            return { authorized: true, isAdmin: true };
        }
    }

    // 2. Check if authorized parent
    if (parentPasscode && parentEmail) {
        const normalizedEmail = parentEmail.trim().toLowerCase();
        const record = await prisma.parentPasscode.findUnique({
            where: { parentEmail: normalizedEmail }
        });

        if (record && record.passcode && record.passcode === hashPasscode(parentPasscode)) {
            return { authorized: true, isAdmin: false };
        }
    }

    return { authorized: false, isAdmin: false };
}

// Handle GET /api/kids/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const kid = await prisma.kid.findUnique({
            where: { id }
        });
        if (!kid) {
            return NextResponse.json(
                { success: false, error: "Kid profile not found." },
                { status: 404 }
            );
        }

        const { authorized } = await verifyAccess(request, kid.parentEmail);
        if (!authorized) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Access to this child profile is restricted." },
                { status: 403 }
            );
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const mappedKid = { ...kid };
        if (mappedKid.checkedIn && new Date(mappedKid.lastStatusChange) < startOfToday) {
            mappedKid.checkedIn = false;
        }

        return NextResponse.json({ success: true, data: mappedKid });
    } catch (error) {
        console.error("GET /api/kids/[id] error:", error);
        const errMsg = error instanceof Error ? error.message : "Failed to fetch kid profile";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}

// Handle PUT /api/kids/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate required fields
        const requiredFields = [
            "firstName",
            "lastName",
            "age",
            "gender",
            "parentName",
            "parentEmail",
            "authorizedToPickup",
            "parentPhone",
            "emergencyContactName",
            "emergencyContactPhone"
        ];

        for (const field of requiredFields) {
            if (body[field] === undefined || body[field] === null || String(body[field]).trim() === "") {
                return NextResponse.json(
                    { success: false, error: `Field '${field}' is required.` },
                    { status: 400 }
                );
            }
        }

        // Check if kid exists
        const existingKid = await prisma.kid.findUnique({
            where: { id }
        });
        if (!existingKid) {
            return NextResponse.json(
                { success: false, error: "Kid profile not found." },
                { status: 404 }
            );
        }

        const { authorized, isAdmin } = await verifyAccess(request, existingKid.parentEmail);
        if (!authorized) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Modification of this child profile is restricted." },
                { status: 403 }
            );
        }

        // Prevent parents from changing the registered parent email (escalation vector)
        if (!isAdmin) {
            if (body.parentEmail.trim().toLowerCase() !== existingKid.parentEmail.toLowerCase()) {
                return NextResponse.json(
                    { success: false, error: "Unauthorized. Parents are not permitted to modify the registered parent email address." },
                    { status: 403 }
                );
            }
        }

        // Update fields
        const updatedKid = await prisma.kid.update({
            where: { id },
            data: {
                firstName: body.firstName.trim(),
                lastName: body.lastName.trim(),
                age: Number(body.age),
                gender: body.gender.trim(),
                parentName: body.parentName.trim(),
                parentEmail: body.parentEmail.trim().toLowerCase(),
                authorizedToPickup: body.authorizedToPickup.trim(),
                parentPhone: body.parentPhone.trim(),
                emergencyContactName: body.emergencyContactName.trim(),
                emergencyContactPhone: body.emergencyContactPhone.trim(),
                notes: body.notes?.trim() || "",
                registrationStart: body.registrationStart ? new Date(body.registrationStart) : null,
                registrationEnd: body.registrationEnd ? new Date(body.registrationEnd) : null,
            }
        });

        return NextResponse.json({ success: true, data: updatedKid });
    } catch (error) {
        console.error("PUT /api/kids/[id] error:", error);
        const errMsg = error instanceof Error ? error.message : "Failed to update kid profile";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
