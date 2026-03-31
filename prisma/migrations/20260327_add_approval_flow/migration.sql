-- AlterTable
ALTER TABLE `Report` 
    ADD COLUMN `approvalStep` TINYINT NOT NULL DEFAULT 0,
    ADD COLUMN `currentApproverId` BIGINT NULL;

-- CreateTable
CREATE TABLE `ReportApproval` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `report_id` BIGINT NOT NULL,
    `approver_id` BIGINT NOT NULL,
    `step` TINYINT NOT NULL,
    `action` TINYINT NOT NULL,
    `remark` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReportApproval` ADD CONSTRAINT `ReportApproval_report_id_fkey` 
FOREIGN KEY (`report_id`) REFERENCES `Report`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportApproval` ADD CONSTRAINT `ReportApproval_approver_id_fkey` 
FOREIGN KEY (`approver_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
