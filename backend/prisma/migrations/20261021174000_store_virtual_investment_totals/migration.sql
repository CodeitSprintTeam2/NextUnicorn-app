ALTER TABLE "companies"
ADD COLUMN "virtual_investment" DECIMAL(38, 0) NOT NULL DEFAULT 0;

UPDATE "companies" AS company
SET "virtual_investment" = totals.total
FROM (
  SELECT "company_id", SUM("amount") AS total
  FROM "investments"
  WHERE "deleted_at" IS NULL
  GROUP BY "company_id"
) AS totals
WHERE company."id" = totals."company_id";
