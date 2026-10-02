CREATE TABLE `kyc_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'none' NOT NULL,
	`identity` text,
	`documents` text,
	`beneficial_owners` text,
	`screening` text,
	`rejection_reason` text,
	`submitted_at` integer,
	`decided_at` integer,
	`auto_decide_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kyc_applications_user_id_unique` ON `kyc_applications` (`user_id`);--> statement-breakpoint
CREATE INDEX `kyc_applications_status_idx` ON `kyc_applications` (`status`);