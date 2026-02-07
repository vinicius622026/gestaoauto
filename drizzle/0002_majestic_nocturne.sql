CREATE TABLE `images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`vehicleId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` text NOT NULL,
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(50) NOT NULL DEFAULT 'image/jpeg',
	`fileSize` int,
	`isCover` boolean NOT NULL DEFAULT false,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
