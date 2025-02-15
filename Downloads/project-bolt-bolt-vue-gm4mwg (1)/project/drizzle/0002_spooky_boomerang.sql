DROP TABLE `banks`;--> statement-breakpoint
DROP TABLE `cost_centers`;--> statement-breakpoint
DROP TABLE `cost_types`;--> statement-breakpoint
DROP TABLE `customer_bank_accounts`;--> statement-breakpoint
DROP TABLE `customers`;--> statement-breakpoint
DROP TABLE `supplier_bank_accounts`;--> statement-breakpoint
DROP TABLE `suppliers`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE users ADD `document` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_document_unique` ON `users` (`document`);