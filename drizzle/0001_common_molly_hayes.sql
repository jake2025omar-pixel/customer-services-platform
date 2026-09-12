CREATE TABLE `audit_logs` (
	`id` varchar(64) NOT NULL,
	`userId` int,
	`action` varchar(64) NOT NULL,
	`referenceId` varchar(160),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `points_ledger` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`type` enum('REWARD','PURCHASE','SERVICE','REFUND','ADJUSTMENT') NOT NULL,
	`amount` int NOT NULL,
	`referenceId` varchar(160),
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `points_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reward_sessions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`adPlacement` varchar(128) NOT NULL,
	`sessionTokenHash` varchar(128) NOT NULL,
	`status` enum('CREATED','STARTED','PENDING_VERIFICATION','VERIFIED','REWARDED','EXPIRED','REJECTED') NOT NULL DEFAULT 'CREATED',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`rewardTransactionId` varchar(64),
	CONSTRAINT `reward_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `reward_sessions_sessionTokenHash_unique` UNIQUE(`sessionTokenHash`)
);
--> statement-breakpoint
CREATE TABLE `reward_transactions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`rewardSessionId` varchar(64) NOT NULL,
	`provider` varchar(64) NOT NULL,
	`providerTransactionId` varchar(160) NOT NULL,
	`rewardAmount` int NOT NULL,
	`status` enum('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`verifiedAt` timestamp,
	CONSTRAINT `reward_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `reward_tx_provider_transaction_unique` UNIQUE(`provider`,`providerTransactionId`)
);
--> statement-breakpoint
CREATE INDEX `audit_action_created_idx` ON `audit_logs` (`action`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ledger_user_created_idx` ON `points_ledger` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `reward_sessions_user_status_idx` ON `reward_sessions` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `reward_tx_user_created_idx` ON `reward_transactions` (`userId`,`createdAt`);