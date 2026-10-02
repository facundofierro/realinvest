CREATE TABLE `trades` (
	`id` text PRIMARY KEY NOT NULL,
	`token_id` text NOT NULL,
	`price` real NOT NULL,
	`amount` integer NOT NULL,
	`taker_side` text NOT NULL,
	`buy_position_id` text NOT NULL,
	`sell_position_id` text NOT NULL,
	`buy_user_id` text NOT NULL,
	`sell_user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`token_id`) REFERENCES `market_tokens`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`buy_position_id`) REFERENCES `positions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sell_position_id`) REFERENCES `positions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`buy_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sell_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `trades_token_id_created_at_idx` ON `trades` (`token_id`,`created_at`);--> statement-breakpoint
DROP TABLE `order_book_levels`;--> statement-breakpoint
ALTER TABLE `holdings` ADD `locked_tokens` integer DEFAULT 0 NOT NULL;