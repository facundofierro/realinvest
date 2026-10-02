CREATE TABLE `fireblocks_account_freezes` (
	`vault_account_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`frozen` integer NOT NULL,
	`reason` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`vault_account_id`, `asset_id`),
	FOREIGN KEY (`vault_account_id`) REFERENCES `fireblocks_vault_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fireblocks_asset_operations` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`vault_account_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`amount` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`vault_account_id`) REFERENCES `fireblocks_vault_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fireblocks_asset_operations_idempotency_key_unique` ON `fireblocks_asset_operations` (`idempotency_key`);--> statement-breakpoint
CREATE TABLE `fireblocks_asset_pauses` (
	`asset_id` text PRIMARY KEY NOT NULL,
	`paused` integer NOT NULL,
	`reason` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fireblocks_balances` (
	`vault_account_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`total` text DEFAULT '0' NOT NULL,
	`available` text DEFAULT '0' NOT NULL,
	`pending` text DEFAULT '0' NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`vault_account_id`, `asset_id`),
	FOREIGN KEY (`vault_account_id`) REFERENCES `fireblocks_vault_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fireblocks_deposit_addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`vault_account_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`address` text NOT NULL,
	`tag` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`vault_account_id`) REFERENCES `fireblocks_vault_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `fireblocks_deposit_addresses_vault_asset_idx` ON `fireblocks_deposit_addresses` (`vault_account_id`,`asset_id`);--> statement-breakpoint
CREATE TABLE `fireblocks_eligibility` (
	`vault_account_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`eligible` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`vault_account_id`, `asset_id`),
	FOREIGN KEY (`vault_account_id`) REFERENCES `fireblocks_vault_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fireblocks_ramp_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`vault_account_id` text NOT NULL,
	`direction` text NOT NULL,
	`fiat_currency` text NOT NULL,
	`fiat_amount` text NOT NULL,
	`asset_id` text NOT NULL,
	`asset_amount` text NOT NULL,
	`status` text NOT NULL,
	`payment_reference` text,
	`idempotency_key` text NOT NULL,
	`failure_reason` text,
	`completion_at` integer NOT NULL,
	`intended_outcome` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`vault_account_id`) REFERENCES `fireblocks_vault_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fireblocks_ramp_requests_idempotency_key_unique` ON `fireblocks_ramp_requests` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `fireblocks_ramp_requests_vault_idx` ON `fireblocks_ramp_requests` (`vault_account_id`);--> statement-breakpoint
CREATE TABLE `fireblocks_transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`amount` text NOT NULL,
	`source_vault_account_id` text NOT NULL,
	`destination_type` text NOT NULL,
	`destination_vault_account_id` text,
	`destination_address` text,
	`destination_tag` text,
	`direction` text NOT NULL,
	`status` text NOT NULL,
	`note` text,
	`external_tx_id` text,
	`idempotency_key` text NOT NULL,
	`failure_reason` text,
	`confirming_at` integer NOT NULL,
	`completion_at` integer NOT NULL,
	`intended_outcome` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source_vault_account_id`) REFERENCES `fireblocks_vault_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_vault_account_id`) REFERENCES `fireblocks_vault_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fireblocks_transfers_idempotency_key_unique` ON `fireblocks_transfers` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `fireblocks_transfers_source_idx` ON `fireblocks_transfers` (`source_vault_account_id`);--> statement-breakpoint
CREATE INDEX `fireblocks_transfers_destination_idx` ON `fireblocks_transfers` (`destination_vault_account_id`);--> statement-breakpoint
CREATE TABLE `fireblocks_vault_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`customer_ref_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fireblocks_vault_assets` (
	`vault_account_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`vault_account_id`, `asset_id`),
	FOREIGN KEY (`vault_account_id`) REFERENCES `fireblocks_vault_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
