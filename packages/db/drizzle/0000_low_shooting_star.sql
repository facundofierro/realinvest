CREATE TABLE `accounts` (
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `balances` (
	`user_id` text NOT NULL,
	`currency_code` text NOT NULL,
	`available` real DEFAULT 0 NOT NULL,
	`locked` real DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `currency_code`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `holdings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_id` text NOT NULL,
	`tokens` integer NOT NULL,
	`cost_basis_price_usd` real,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`token_id`) REFERENCES `market_tokens`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `holdings_user_id_token_id_unique` ON `holdings` (`user_id`,`token_id`);--> statement-breakpoint
CREATE INDEX `holdings_user_id_idx` ON `holdings` (`user_id`);--> statement-breakpoint
CREATE TABLE `market_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`symbol` text NOT NULL,
	`project_id` text NOT NULL,
	`unit_id` text,
	`price_usd` real NOT NULL,
	`market_cap_usd` real NOT NULL,
	`change_24h_pct` real NOT NULL,
	`change_7d_pct` real NOT NULL,
	`change_30d_pct` real NOT NULL,
	`change_all_pct` real NOT NULL,
	`live_since` text NOT NULL,
	`tokens_available` integer,
	`roi_pct` real,
	`buy_price_usd` real,
	`sell_price_usd` real,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `market_tokens_symbol_unique` ON `market_tokens` (`symbol`);--> statement-breakpoint
CREATE INDEX `market_tokens_project_id_idx` ON `market_tokens` (`project_id`);--> statement-breakpoint
CREATE TABLE `order_book_levels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token_id` text NOT NULL,
	`side` text NOT NULL,
	`price` real NOT NULL,
	`amount` integer NOT NULL,
	FOREIGN KEY (`token_id`) REFERENCES `market_tokens`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_book_levels_token_id_idx` ON `order_book_levels` (`token_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `order_book_levels_token_id_side_price_unique` ON `order_book_levels` (`token_id`,`side`,`price`);--> statement-breakpoint
CREATE TABLE `positions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_id` text NOT NULL,
	`side` text NOT NULL,
	`total_amount` integer NOT NULL,
	`filled_amount` integer DEFAULT 0 NOT NULL,
	`order_price_usd` real NOT NULL,
	`opened_market_price_usd` real,
	`opened_at` integer NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`token_id`) REFERENCES `market_tokens`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `positions_user_id_status_idx` ON `positions` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `positions_token_id_idx` ON `positions` (`token_id`);--> statement-breakpoint
CREATE TABLE `project_stories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`image` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`image` text NOT NULL,
	`status` text NOT NULL,
	`roi_pct` real NOT NULL,
	`progress_pct` integer NOT NULL,
	`price_range_usd` text,
	`fixed_rent_pct` real,
	`tokens_total` integer,
	`launch_date` text,
	`next_launch_date` text,
	`is_featured` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `purchase_options` (
	`key` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`header_icon` text NOT NULL,
	`header_icon_class_name` text NOT NULL,
	`watermark_icon` text NOT NULL,
	`card_class_name` text NOT NULL,
	`badge_text` text NOT NULL,
	`badge_class_name` text NOT NULL,
	`value_label` text NOT NULL,
	`value` text NOT NULL,
	`action_text` text NOT NULL,
	`get_href` text NOT NULL,
	`action_class_name` text NOT NULL,
	`icon_container_class_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `stages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	`units` integer NOT NULL,
	`available` integer NOT NULL,
	`min_price` real NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stages_project_id_idx` ON `stages` (`project_id`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`amount` real NOT NULL,
	`currency_code` text DEFAULT 'USDT' NOT NULL,
	`description` text,
	`metadata` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `transactions_user_id_created_at_idx` ON `transactions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`unit_code` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`floor` text NOT NULL,
	`token_symbol` text,
	`token_name` text,
	`is_tokenized` integer NOT NULL,
	`status` text NOT NULL,
	`status_raw` text,
	`price` text NOT NULL,
	`area_m2` real,
	`area` text,
	`bedrooms` integer,
	`bathrooms` integer,
	`floor_plan_image` text,
	`investment_type` text,
	`queue_order` integer,
	`orientation` text,
	`total_tokens` integer,
	`tokens_sold` integer,
	`negotiated_amount` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `units_project_id_idx` ON `units` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `units_project_id_unit_code_unique` ON `units` (`project_id`,`unit_code`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer,
	`image` text,
	`kyc_status` text DEFAULT 'none' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);