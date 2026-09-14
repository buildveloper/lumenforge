ALTER TABLE `clients` ADD `client_user_id` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `claimed_at` text;--> statement-breakpoint
CREATE INDEX `clients_client_user_id_idx` ON `clients` (`client_user_id`);--> statement-breakpoint
CREATE INDEX `clients_email_idx` ON `clients` (`email`);--> statement-breakpoint
ALTER TABLE `users` ADD `notify_project_updates` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notify_task_assignments` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notify_invoice_status` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notify_ai_completion` integer DEFAULT false NOT NULL;