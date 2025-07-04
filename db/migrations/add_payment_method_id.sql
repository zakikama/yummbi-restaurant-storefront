-- Add payment_method_id column to orders table for Stripe integration
ALTER TABLE public.orders 
ADD COLUMN payment_method_id VARCHAR(255);

-- Add payment_intent_id column to store Stripe payment intent ID
ALTER TABLE public.orders 
ADD COLUMN payment_intent_id VARCHAR(255);

-- Add comments to explain the fields
COMMENT ON COLUMN public.orders.payment_method_id IS 'Stripe payment method ID for card payments, null for cash/other payment methods';
COMMENT ON COLUMN public.orders.payment_intent_id IS 'Stripe payment intent ID for confirmed payments, null for cash/other payment methods'; 