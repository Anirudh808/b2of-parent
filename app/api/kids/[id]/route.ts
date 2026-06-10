import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

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

        return NextResponse.json({ success: true, data: kid });
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
