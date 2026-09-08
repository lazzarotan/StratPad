-- CreateTable
CREATE TABLE "SingleImageModule" (
    "moduleId" TEXT NOT NULL,
    "imageAssetId" INTEGER,

    CONSTRAINT "SingleImageModule_pkey" PRIMARY KEY ("moduleId")
);

-- CreateTable
CREATE TABLE "ImageAsset" (
    "imageAssetId" SERIAL NOT NULL,
    "storageKey" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "ImageAsset_pkey" PRIMARY KEY ("imageAssetId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageAsset_storageKey_key" ON "ImageAsset"("storageKey");

-- CreateIndex
CREATE INDEX "ImageAsset_ownerId_idx" ON "ImageAsset"("ownerId");

-- AddForeignKey
ALTER TABLE "SingleImageModule" ADD CONSTRAINT "SingleImageModule_imageAssetId_fkey" FOREIGN KEY ("imageAssetId") REFERENCES "ImageAsset"("imageAssetId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SingleImageModule" ADD CONSTRAINT "SingleImageModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ImageAsset" ADD CONSTRAINT "ImageAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
