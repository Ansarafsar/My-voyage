-- My Voyages Database Setup
-- Copy and paste this entire script into your Supabase SQL Editor

-- Create travel stories table
CREATE TABLE travel_stories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('local', 'interstate', 'international', 'speechless_people')),
  story_content TEXT NOT NULL,
  image_url TEXT,
  location VARCHAR(255),
  travel_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (optional for now)
ALTER TABLE travel_stories ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public reads
CREATE POLICY "Allow public read" ON travel_stories
  FOR SELECT USING (true);

-- Insert a sample story for testing (optional)
INSERT INTO travel_stories (title, category, story_content, location, travel_date) 
VALUES ('Welcome to My Voyages!', 'local', 'This is a sample story to test the database setup. Add your first real story through the admin panel!', 'Your City', '2024-01-01');

-- Check if table was created successfully
SELECT * FROM travel_stories LIMIT 5;