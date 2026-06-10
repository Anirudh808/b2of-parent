import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

// SMTP Configuration from environment variables
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === "true"; // true for 465, false for other ports
const emailFrom = process.env.SMTP_FROM || '"AcaCheck Security" <noreply@acacheck.com>';

const hasSmtpConfig = !!smtpPass;

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

        // 1. Verify parent email is registered to at least one child profile.
        const parentRecord = await prisma.kid.findFirst({
            where: { parentEmail: normalizedEmail }
        });
        if (!parentRecord) {
            return NextResponse.json(
                { success: false, error: "This email address is not registered under any child profile." },
                { status: 404 }
            );
        }

        // 2. Generate a 6-digit numerical OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

        // 3. Upsert OTP details in ParentPasscode
        await prisma.parentPasscode.upsert({
            where: { parentEmail: normalizedEmail },
            update: {
                otp,
                otpExpiry
            },
            create: {
                parentEmail: normalizedEmail,
                passcode: "", // Placeholder, will be set on OTP verification
                otp,
                otpExpiry
            }
        });

        let emailSent = false;
        let mailErrorMsg = "";

        // 4. Send actual email if SMTP configuration is available
        if (hasSmtpConfig) {
            try {
                // Normalize smtp.google.com to smtp.gmail.com if configured by mistake
                const targetHost = smtpHost === "smtp.google.com" ? "smtp.gmail.com" : smtpHost;

                const transportConfig = {
                    host: targetHost || "smtp.gmail.com",
                    port: smtpPort,
                    secure: smtpSecure === true || smtpPort === 465,
                    auth: {
                        user: smtpUser || "anirudhmounasamy@gmail.com",
                        pass: smtpPass,
                    },
                    connectionTimeout: 5000,
                    greetingTimeout: 5000,
                    socketTimeout: 10000,
                };

                const transporter = nodemailer.createTransport(transportConfig);
                console.log(`Nodemailer transporter created with host: ${transportConfig.host}, port: ${transportConfig.port}, secure: ${transportConfig.secure}, user: ${transportConfig.auth.user}`);

                await transporter.sendMail({
                    from: emailFrom,
                    to: normalizedEmail,
                    subject: "AcaCheck Child Safety OTP Verification Code",
                    text: `Your academy check-in/out verification code is: ${otp}. It will expire in 5 minutes.`,
                    html: `
                        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 24px; color: #1e293b; background-color: #ffffff;">
                            <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 18px; font-weight: bold; color: #0f172a;">AcaCheck Security</span>
                            </div>
                            <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Verify Parent Identity</h2>
                            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                                A check-in/out action or passcode request has been initiated for your child. Please enter the following 6-digit verification code:
                            </p>
                            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 18px; border-radius: 16px; font-size: 28px; font-weight: 900; text-align: center; letter-spacing: 6px; color: #4f46e5; margin-bottom: 24px;">
                                ${otp}
                            </div>
                            <p style="font-size: 11px; line-height: 1.5; color: #94a3b8; margin: 0;">
                                This security token is valid for 5 minutes. If you did not request this verification, please contact the academy office immediately to ensure child safety.
                            </p>
                        </div>
                    `,
                });
                emailSent = true;
                console.log(`[EMAIL SENT] Real verification email successfully delivered to ${normalizedEmail}`);
            } catch (smtpError) {
                console.error("Nodemailer SMTP transport error:", smtpError);
                mailErrorMsg = smtpError instanceof Error ? smtpError.message : "SMTP transmission failure";
            }
        } else {
            console.error("SMTP_PASS configuration is missing. Cannot send verification email.");
            mailErrorMsg = "SMTP config missing";
        }

        // 5. Log OTP transactions to server console for testing convenience
        console.log(`\n========================================`);
        console.log(`[OTP TRANSACTION LOG] Parent: ${normalizedEmail}`);
        console.log(`[OTP CODE]: ${otp}`);
        console.log(`[SMTP STATUS]: ${emailSent ? "SUCCESS" : hasSmtpConfig ? `FAILED (${mailErrorMsg})` : "UNCONFIGURED (MOCK MODE)"}`);
        console.log(`========================================\n`);

        return NextResponse.json({
            success: true,
            message: emailSent 
                ? "OTP sent successfully to your email address." 
                : hasSmtpConfig 
                    ? `Failed to deliver email via SMTP: ${mailErrorMsg}` 
                    : "OTP sent successfully (mock console log).",
            emailSent
        });
    } catch (error) {
        console.error("send-otp error:", error);
        const errMsg = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { success: false, error: errMsg },
            { status: 500 }
        );
    }
}
