import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// Handle GET requests: Fetch all kids (Admin) or search by firstName and lastName (Parent)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const firstName = searchParams.get("firstName")?.trim();
        const lastName = searchParams.get("lastName")?.trim();

        const query: {
            firstName?: { contains: string; mode: "insensitive" };
            lastName?: { contains: string; mode: "insensitive" };
        } = {};

        // Case-insensitive contains search for PostgreSQL
        if (firstName) {
            query.firstName = {
                contains: firstName,
                mode: "insensitive",
            };
        }
        if (lastName) {
            query.lastName = {
                contains: lastName,
                mode: "insensitive",
            };
        }

        const kids = await prisma.kid.findMany({
            where: query,
            orderBy: [
                { firstName: "asc" },
                { lastName: "asc" },
            ],
        });

        return NextResponse.json({ success: true, data: kids });
    } catch (error) {
        console.error("GET /api/kids error:", error);
        const errMsg = error instanceof Error ? error.message : "Failed to fetch kids";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}

// Handle POST requests: Create a new kid profile (Admin)
export async function POST(request: NextRequest) {
    try {
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

        const newKid = await prisma.kid.create({
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
                checkedIn: false,
                lastStatusChange: new Date(),
                registrationStart: body.registrationStart ? new Date(body.registrationStart) : null,
                registrationEnd: body.registrationEnd ? new Date(body.registrationEnd) : null,
            }
        });

        return NextResponse.json({ success: true, data: newKid }, { status: 201 });
    } catch (error) {
        console.error("POST /api/kids error:", error);
        const errMsg = error instanceof Error ? error.message : "Failed to create kid profile";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
