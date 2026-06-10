-- 1. Add the column with a temporary default value so existing rows don't crash
ALTER TABLE "AdminUser" ADD COLUMN "fullName" TEXT NOT NULL DEFAULT '';

-- 2. Update your target record with the actual name
UPDATE "AdminUser" SET "fullName" = 'Sahitiyan' WHERE "email" = 'sahitiyan@gmail.com';

-- 3. (Optional) Remove the default constraint if you want Prisma to force future inserts to explicitly provide a fullName
ALTER TABLE "AdminUser" ALTER COLUMN "fullName" DROP DEFAULT;
