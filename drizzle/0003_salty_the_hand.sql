CREATE TABLE `whatsappLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`vehicleId` int NOT NULL,
	`visitorId` varchar(255),
	`userAgent` text,
	`wasCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappLeads_id` PRIMARY KEY(`id`)
);
