CREATE TABLE `campaign_entries` (
	`id` varchar(64) NOT NULL,
	`campaignId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`ticketsSpent` int NOT NULL,
	`idempotencyKey` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_entries_idempotencyKey_unique` UNIQUE(`idempotencyKey`),
	CONSTRAINT `campaign_entries_campaign_user_unique` UNIQUE(`campaignId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` varchar(64) NOT NULL,
	`name` varchar(180) NOT NULL,
	`prize` text NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`eligibility` text NOT NULL,
	`officialRules` text NOT NULL,
	`winnerSelection` text NOT NULL,
	`prizeDelivery` text NOT NULL,
	`ticketCost` int NOT NULL DEFAULT 50,
	`isActive` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`serviceId` varchar(64) NOT NULL,
	`serviceTitle` varchar(180) NOT NULL,
	`googleEmail` varchar(320) NOT NULL,
	`pointsPrice` int,
	`usdPrice` decimal(10,2),
	`paymentProvider` varchar(64) NOT NULL,
	`paymentReference` varchar(180) NOT NULL,
	`status` enum('PAID','TELEGRAM_SENT','TELEGRAM_FAILED','CANCELLED') NOT NULL DEFAULT 'PAID',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`telegramSentAt` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_provider_payment_unique` UNIQUE(`paymentProvider`,`paymentReference`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(64) NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` varchar(512) NOT NULL,
	`imageKey` varchar(512),
	`pointsPrice` int,
	`usdPrice` decimal(10,2),
	`category` varchar(80) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `campaign_entries_campaign_created_idx` ON `campaign_entries` (`campaignId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `campaigns_active_dates_idx` ON `campaigns` (`isActive`,`startsAt`,`endsAt`);--> statement-breakpoint
CREATE INDEX `orders_user_created_idx` ON `orders` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `services_active_category_idx` ON `services` (`isActive`,`category`);