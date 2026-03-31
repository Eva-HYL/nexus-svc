-- CreateTable
CREATE TABLE `PointTransaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `wallet_id` BIGINT NOT NULL,
    `type` TINYINT NOT NULL,
    `points` DECIMAL(10, 2) NOT NULL,
    `amount` DECIMAL(10, 2) NULL,
    `pay_method` TINYINT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `remark` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PointTransaction_wallet_id_created_at_idx`(`wallet_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PointTransaction` ADD CONSTRAINT `PointTransaction_wallet_id_fkey` 
FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
