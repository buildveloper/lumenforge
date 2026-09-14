DROP INDEX `invoices_invoice_number_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_user_number_idx` ON `invoices` (`user_id`,`invoice_number`);