DO $$ BEGIN
	IF EXISTS (SELECT 1 FROM "products" WHERE "category"::text IN ('machinery', 'fabrication')) THEN
		RAISE EXCEPTION 'Delete all machinery and fabrication products in /admin first, then run this migration again.';
	END IF;
END $$;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
UPDATE "products" SET "category" = 'fruits' WHERE "category" = 'produce';--> statement-breakpoint
DROP TYPE "public"."product_category";--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('fruits', 'vegetables');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category" SET DATA TYPE "public"."product_category" USING "category"::"public"."product_category";
