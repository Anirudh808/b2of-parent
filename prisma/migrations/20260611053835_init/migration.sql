-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PARENT');

-- CreateTable
CREATE TABLE "Kid" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARENT',
    "authorizedToPickup" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "lastStatusChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrationStart" TIMESTAMP(3),
    "registrationEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckInOutLog" (
    "id" TEXT NOT NULL,
    "kidId" TEXT NOT NULL,
    "kidName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckInOutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentPasscode" (
    "id" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "passcode" TEXT NOT NULL,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentPasscode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Kid_parentEmail_idx" ON "Kid"("parentEmail");

-- CreateIndex
CREATE INDEX "CheckInOutLog_kidId_idx" ON "CheckInOutLog"("kidId");

-- CreateIndex
CREATE INDEX "CheckInOutLog_parentEmail_idx" ON "CheckInOutLog"("parentEmail");

-- CreateIndex
CREATE UNIQUE INDEX "ParentPasscode_parentEmail_key" ON "ParentPasscode"("parentEmail");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "CheckInOutLog" ADD CONSTRAINT "CheckInOutLog_kidId_fkey" FOREIGN KEY ("kidId") REFERENCES "Kid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
