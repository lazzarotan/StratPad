-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ModuleType" ADD VALUE 'resourceBar';
ALTER TYPE "ModuleType" ADD VALUE 'list';

-- CreateTable
CREATE TABLE "ResourceBarModule" (
    "moduleId" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL DEFAULT 'Resource Bar',
    "bars" JSON NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ResourceBarModule_pkey" PRIMARY KEY ("moduleId")
);

-- CreateTable
CREATE TABLE "ListModule" (
    "moduleId" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL DEFAULT 'List',
    "showCheckbox" BOOLEAN NOT NULL DEFAULT true,
    "showQuantity" BOOLEAN NOT NULL DEFAULT true,
    "items" JSON NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ListModule_pkey" PRIMARY KEY ("moduleId")
);

-- AddForeignKey
ALTER TABLE "ResourceBarModule" ADD CONSTRAINT "ResourceBarModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ListModule" ADD CONSTRAINT "ListModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;
