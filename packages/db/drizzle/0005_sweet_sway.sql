CREATE TABLE `demo_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`role` text,
	`email` text NOT NULL,
	`phone` text,
	`country` text NOT NULL,
	`city` text,
	`project_count` text,
	`interests` text NOT NULL,
	`comments` text,
	`source` text DEFAULT 'landing' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `demo_requests_email_idx` ON `demo_requests` (`email`);--> statement-breakpoint
CREATE INDEX `demo_requests_created_at_idx` ON `demo_requests` (`created_at`);