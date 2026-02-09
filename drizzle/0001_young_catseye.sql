CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tenantId` int NOT NULL,
	`role` enum('admin','user') NOT NULL DEFAULT 'user',
	`isActive` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_tenant` UNIQUE(`userId`,`tenantId`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subdomain` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`logoUrl` text,
	`contactEmail` varchar(320),
	`phone` varchar(20),
	`address` text,
	`city` varchar(100),
	`state` varchar(100),
	`zipCode` varchar(20),
	`country` varchar(100),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_subdomain_unique` UNIQUE(`subdomain`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int NOT NULL,
	`color` varchar(50),
	`vin` varchar(17),
	`licensePlate` varchar(20),
	`mileage` int DEFAULT 0,
	`fuelType` enum('gasoline','diesel','electric','hybrid'),
	`transmission` enum('manual','automatic'),
	`price` decimal(12,2) NOT NULL,
	`description` text,
	`imageUrls` json DEFAULT ('[]'),
	`status` enum('available','sold','maintenance') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_vin_unique` UNIQUE(`vin`),
	CONSTRAINT `vehicles_licensePlate_unique` UNIQUE(`licensePlate`)
);
--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `fk_announcements_tenantId` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `announcements` ADD CONSTRAINT `fk_announcements_createdByUserId` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `fk_profiles_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `fk_profiles_tenantId` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `fk_vehicles_tenantId` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_tenantId` ON `announcements` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_isPublished` ON `announcements` (`isPublished`);--> statement-breakpoint
CREATE INDEX `idx_createdByUserId` ON `announcements` (`createdByUserId`);--> statement-breakpoint
CREATE INDEX `idx_userId` ON `profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_tenantId` ON `profiles` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_user_active` ON `profiles` (`userId`,`isActive`);--> statement-breakpoint
CREATE INDEX `idx_subdomain` ON `tenants` (`subdomain`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `tenants` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tenantId` ON `vehicles` (`tenantId`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `vehicles` (`status`);--> statement-breakpoint
CREATE INDEX `idx_make_model` ON `vehicles` (`make`,`model`);--> statement-breakpoint
CREATE INDEX `idx_openId` ON `users` (`openId`);