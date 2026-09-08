-- AlterEnum
ALTER TYPE "ModuleType" ADD VALUE 'nestedDictionary';

-- CreateTable
CREATE TABLE "NestedDictionaryModule" (
    "moduleId" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL DEFAULT 'Nested Dictionary',
    "dictionary" JSON NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NestedDictionaryModule_pkey" PRIMARY KEY ("moduleId")
);

-- AddForeignKey
ALTER TABLE "NestedDictionaryModule" ADD CONSTRAINT "NestedDictionaryModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;
