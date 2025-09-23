-- Clear existing data in the correct order
TRUNCATE TABLE ideas RESTART IDENTITY CASCADE;
TRUNCATE TABLE profiles RESTART IDENTITY CASCADE;

-- Seed Profiles
-- Note: The user_id corresponds to the UUIDs defined in the seed_demo.ts script
-- Entrepreneurs
INSERT INTO profiles (id, full_name, role, bio) VALUES
('5a99a46a-31b3-4798-8224-74ce3585d41c', 'Rohan Kumar', 'entrepreneur', 'Passionate innovator in the tech space.'),
('3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7', 'Isha Reddy', 'entrepreneur', 'Building sustainable solutions for tomorrow.'),
('a8e7a6e4-4d2c-4b13-9c86-64c8f2d4a7c1', 'Arjun Singh', 'entrepreneur', 'Focused on disrupting EdTech.'),
('d2e3f4c1-9b8e-4a7d-8c6f-5b4a3c2d1e0f', 'Meera Patel', 'entrepreneur', 'Creating beautiful and functional consumer products.'),
('c1b2a3d4-8e7f-4c6a-9b5d-4a3c2d1e0f9b', 'Karan Chopra', 'entrepreneur', 'Fintech enthusiast and blockchain believer.');

-- Investors
INSERT INTO profiles (id, full_name, role, bio, website_url, linkedin_url) VALUES
('b9d8c7e6-5f4a-4b3c-2d1e-0f9a8b7c6d5e', 'Priya Sharma', 'investor', 'Early-stage tech investor with a focus on SaaS and AI.', 'https://venture.dev', 'https://linkedin.com/in/priyasharma'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Vikram Mehta', 'investor', 'VC specializing in biotech and digital health.', 'https://healthinvest.dev', 'https://linkedin.com/in/vikrammehta'),
('f5e4d3c2-b1a0-9c8d-7e6f-5a4b3c2d1e0f', 'Anjali Gupta', 'investor', 'Angel investor for sustainable consumer products.', 'https://eco.dev', 'https://linkedin.com/in/anjaligupta'),
('d4c3b2a1-e0f9-a8b7-c6d5-e4f3a2b1c0d9', 'Ravi Kapoor', 'investor', 'Ex-banker funding the next wave of Fintech.', 'https://fintechfund.dev', 'https://linkedin.com/in/ravikapoor');

-- Seed Ideas
INSERT INTO ideas (entrepreneur_id, idea_title, anonymized_summary, full_text, sector, investment_required, estimated_returns, prototype_url) VALUES
('3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7', 'Eco-Friendly Packaging Solution', 'A biodegradable packaging alternative to plastics, made from agricultural waste.', 'Full details about the eco-friendly packaging solution...', 'Sustainability', '5L-25L', 'Medium', 'prototypes/eco-packaging.pdf'),
('a8e7a6e4-4d2c-4b13-9c86-64c8f2d4a7c1', 'AI-Powered Health Monitoring App', 'A mobile app that uses AI to monitor vital signs via the phone''s camera.', 'Full details about the AI health app...', 'Healthcare', '26L-1CR', 'High', 'prototypes/health-app.pdf'),
('5a99a46a-31b3-4798-8224-74ce3585d41c', 'Smart Logistics Platform', 'An integrated platform that optimizes supply chain management using IoT and machine learning.', 'Full details about the logistics platform...', 'Tech', '1CR+', 'High', 'prototypes/logistics-platform.pdf');
