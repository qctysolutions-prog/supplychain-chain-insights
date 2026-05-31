CREATE TABLE `news_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`label` varchar(100) NOT NULL,
	`title` text NOT NULL,
	`date` varchar(10) NOT NULL,
	`bullets` text NOT NULL,
	`link` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_articles_id` PRIMARY KEY(`id`)
);
