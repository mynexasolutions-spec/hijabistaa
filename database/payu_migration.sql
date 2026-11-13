-- PayU integration: stores the PayU transaction id we generate per checkout
-- attempt (txnid) and the PayU payment id (mihpayid) returned once paid.
-- Run once in the Supabase SQL editor BEFORE deploying the PayU code, or:
--   node scripts/run-payu-migration.js "postgresql://..."

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payu_txnid TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payu_payment_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_payu_txnid_key ON orders (payu_txnid) WHERE payu_txnid IS NOT NULL;
