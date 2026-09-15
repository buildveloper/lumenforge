-- `IF EXISTS` / `IF NOT EXISTS` because this must survive a database whose
-- schema was synced by `drizzle-kit push`: push creates the compound index
-- straight away and never creates the old single-column one, so a bare
-- `DROP INDEX` aborts the whole migration run and every later migration is
-- silently skipped.
DROP INDEX IF EXISTS `invoices_invoice_number_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `invoices_user_number_idx` ON `invoices` (`user_id`,`invoice_number`);
