-- Sample data for baby metric tracking application

-- Insert sample users
INSERT INTO public.user (id, auth_provider, role) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'email', 'parent'),
  ('22222222-2222-2222-2222-222222222222', 'email', 'parent')
ON CONFLICT (id) DO NOTHING;

-- Insert sample babies
INSERT INTO public.baby (id, name, birth_date, preferred_units) VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Emma', '2024-01-15', 'metric'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Oliver', '2023-11-20', 'imperial')
ON CONFLICT (id) DO NOTHING;

-- Insert caregiver relationships
INSERT INTO public.caregiver_relationship (caregiver_id, baby_id) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT (caregiver_id, baby_id) DO NOTHING;

-- Insert sample entries
INSERT INTO public.entry (id, baby_id, type, payload_json, created_by) VALUES 
  ('feedaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'feed', 
   '{"amount": 120, "unit": "ml", "method": "bottle", "notes": "Good appetite"}', 
   '11111111-1111-1111-1111-111111111111'),
  ('sleepbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sleep',
   '{"duration": 180, "quality": "good", "location": "crib"}',
   '11111111-1111-1111-1111-111111111111'),
  ('diapercc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'diaper',
   '{"type": "wet", "rash": false, "notes": "Normal"}',
   '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;