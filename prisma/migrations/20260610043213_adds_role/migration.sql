-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PARENT');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Kid" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'PARENT';
