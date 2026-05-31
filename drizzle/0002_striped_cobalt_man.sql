CREATE TABLE `category_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`is_relevant` int NOT NULL,
	`feedback_text` text,
	`user_id` int,
	`user_email` varchar(320),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `category_feedback_id` PRIMARY KEY(`id`)
);
