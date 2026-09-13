CREATE TABLE `campaign_ticket_ledger` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`campaignId` varchar(64),
	`amount` int NOT NULL,
	`referenceId` varchar(160),
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_ticket_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `campaign_ticket_user_created_idx` ON `campaign_ticket_ledger` (`userId`,`createdAt`);