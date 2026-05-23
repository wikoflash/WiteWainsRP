-- Run this in Supabase SQL editor after running drizzle-kit push

-- Auto-create a profile row when a new user signs up via Discord OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, discord_username, character_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    NEW.raw_user_meta_data->>'avatar_url',
    'viewer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS Policies
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE laws            ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery         ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;

-- Anyone can read public profiles, laws, gallery
CREATE POLICY "Public can read public profiles" ON profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated can read all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Public can read laws" ON laws FOR SELECT USING (true);
CREATE POLICY "Editors can manage laws" ON laws FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'admin'));

CREATE POLICY "Public can read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Editors can manage gallery" ON gallery FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'admin'));

CREATE POLICY "Authenticated can read storage" ON storage_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Editors can manage storage" ON storage_items FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'admin'));

CREATE POLICY "Authenticated can read locations" ON storage_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Editors can manage locations" ON storage_locations FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'admin'));

CREATE POLICY "Editors can read logs" ON storage_logs FOR SELECT TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'admin'));
CREATE POLICY "Editors can insert logs" ON storage_logs FOR INSERT TO authenticated WITH CHECK (true);
