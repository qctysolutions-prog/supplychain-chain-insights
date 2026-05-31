CREATE TABLE `aluminum_pricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`price` varchar(20) NOT NULL,
	`change` varchar(20),
	`change_percent` varchar(10),
	`source` varchar(100) NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aluminum_pricing_id` PRIMARY KEY(`id`)
);
