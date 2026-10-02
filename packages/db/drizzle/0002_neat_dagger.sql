CREATE TABLE `native_auth_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`redirect_uri` text NOT NULL,
	`expires` integer NOT NULL,
	`consumed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `native_auth_codes_user_id_idx` ON `native_auth_codes` (`user_id`);--> statement-breakpoint
CREATE TABLE `native_refresh_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`rotated_from_id` text,
	`expires` integer NOT NULL,
	`consumed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `native_refresh_tokens_user_id_idx` ON `native_refresh_tokens` (`user_id`);