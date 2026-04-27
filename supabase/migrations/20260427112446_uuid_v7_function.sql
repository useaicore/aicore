CREATE OR REPLACE FUNCTION public.gen_uuid_v7()
RETURNS UUID AS $$
DECLARE
  unix_ms BIGINT;
  ts_hex  TEXT;
  rand_a  TEXT;
  rand_b  TEXT;
BEGIN
  unix_ms := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
  ts_hex  := lpad(to_hex((unix_ms >> 16) & x'ffffffff'::BIGINT), 8, '0') || '-'
           || lpad(to_hex(unix_ms & x'ffff'::BIGINT), 4, '0');
  rand_a  := lpad(to_hex((x'7000'::INT | (floor(random() * x'0fff'::INT + 1)::INT))), 4, '0');
  rand_b  := lpad(to_hex((x'8000'::INT | (floor(random() * x'3fff'::INT + 1)::INT))), 4, '0') || '-'
           || lpad(to_hex(floor(random() * 281474976710655 + 1)::BIGINT), 12, '0');
  RETURN (ts_hex || '-' || rand_a || '-' || rand_b)::UUID;
END;
$$ LANGUAGE plpgsql VOLATILE;