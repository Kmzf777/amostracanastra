-- Change affiliate code column type from char(9) to text to avoid padding issues
ALTER TABLE public.affiliates ALTER COLUMN code TYPE text;

-- Trim existing codes to remove any padding spaces
UPDATE public.affiliates SET code = TRIM(code);
