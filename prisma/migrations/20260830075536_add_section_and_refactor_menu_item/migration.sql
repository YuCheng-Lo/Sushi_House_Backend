/*
  Warnings:

  - You are about to drop the column `section` on the `menuitem` table. All the data in the column will be lost.
  - The values [SOLD_OUT] on the enum `MenuItem_status` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `sectionId` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `menuitem` DROP COLUMN `section`,
    ADD COLUMN `sectionId` INTEGER UNSIGNED NOT NULL,
    MODIFY `status` ENUM('ACTIVE', 'HIDDEN') NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE `Section` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `sortOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'HIDDEN') NOT NULL DEFAULT 'ACTIVE',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `MenuItem_sectionId_sortOrder_idx` ON `MenuItem`(`sectionId`, `sortOrder`);

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
