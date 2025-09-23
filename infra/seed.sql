-- Clear existing data to ensure a clean slate
-- Note: In a real production environment, you would be more careful with DELETE statements.
-- This is safe for a demo/development setup.
DELETE FROM public.ideas;
DELETE FROM public.profiles;

-- Seed Profiles
-- This assumes that the users have already been created in the auth.users table
-- by the seed_demo.ts script. The trigger handle_new_user will have already
-- created profile entries for them. This script now UPDATES those profiles with more details.

-- Entrepreneurs
UPDATE public.profiles
SET 
  full_name = 'Rohan Kumar',
  bio = 'Passionate innovator with a background in software engineering. Focused on creating solutions that make a real-world impact. Always learning and building.',
  role = 'entrepreneur'
WHERE id = '5a99a46a-31b3-4798-8224-74ce3585d41c';

UPDATE public.profiles
SET 
  full_name = 'Isha Reddy',
  bio = 'Biologist and environmental advocate dedicated to finding sustainable alternatives to everyday products. Believes in the power of circular economies.',
  role = 'entrepreneur'
WHERE id = '3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7';

UPDATE public.profiles
SET 
  full_name = 'Arjun Singh',
  bio = 'AI and Machine Learning expert with a decade of experience in building scalable tech platforms. Excited by logistics and supply chain optimization.',
  role = 'entrepreneur'
WHERE id = 'a8e7a6e4-4d2c-4b13-9c86-64c8f2d4a7c1';

UPDATE public.profiles
SET 
  full_name = 'Meera Patel',
  bio = 'Educator and technologist aiming to revolutionize the EdTech space with personalized learning tools.',
  role = 'entrepreneur'
WHERE id = 'd2e3f4c1-9b8e-4a7d-8c6f-5b4a3c2d1e0f';

UPDATE public.profiles
SET 
  full_name = 'Karan Chopra',
  bio = 'D2C brand specialist with a knack for marketing and building communities around consumer products.',
  role = 'entrepreneur'
WHERE id = 'c1b2a3d4-8e7f-4c6a-9b5d-4a3c2d1e0f9b';


-- Investors
UPDATE public.profiles
SET 
  full_name = 'Priya Sharma',
  bio = 'Early-stage tech investor with a focus on SaaS and AI. Former product manager at a top tech company looking for the next big thing.',
  website_url = 'https://www.linkedin.com',
  linkedin_url = 'https://www.linkedin.com',
  role = 'investor'
WHERE id = 'b9d8c7e6-5f4a-4b3c-2d1e-0f9a8b7c6d5e';

UPDATE public.profiles
SET 
  full_name = 'Vikram Mehta',
  bio = 'Venture capitalist specializing in biotech and digital health. Looking for disruptive healthcare solutions that can scale globally.',
  website_url = 'https://www.linkedin.com',
  linkedin_url = 'https://www.linkedin.com',
  role = 'investor'
WHERE id = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d';

UPDATE public.profiles
SET 
  full_name = 'Anjali Gupta',
  bio = 'Angel investor passionate about sustainable consumer products and D2C brands that have a positive social impact.',
  website_url = 'https://www.linkedin.com',
  linkedin_url = 'https://www.linkedin.com',
  role = 'investor'
WHERE id = 'f5e4d3c2-b1a0-9c8d-7e6f-5a4b3c2d1e0f';

UPDATE public.profiles
SET 
  full_name = 'Ravi Kapoor',
  bio = 'Ex-banker now funding the next generation of financial technology. Interested in blockchain, DeFi, and payment platforms.',
  website_url = 'https://www.linkedin.com',
  linkedin_url = 'https://www.linkedin.com',
  role = 'investor'
WHERE id = 'd4c3b2a1-e0f9-a8b7-c6d5-e4f3a2b1c0d9';


-- Seed Ideas
INSERT INTO public.ideas (id, entrepreneur_id, idea_title, anonymized_summary, full_text, sector, investment_required, estimated_returns, prototype_url, views) VALUES
('b1a7d7b6-e7f0-4c8d-9a6b-5c4d3e2f1a0b', '3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7', 'Eco-Friendly Packaging Solution', 'A biodegradable and compostable packaging alternative to plastics, made from agricultural waste. Aims to reduce plastic pollution and provide a sustainable solution for businesses worldwide.', 'Full detailed proposal for the eco-friendly packaging solution...', 'Sustainability', '5L-25L', 'Medium', 'prototype_path_1.pdf', 150),
('c8f2d4a7-c1d0-4b3e-8a9b-6d5e4f3c2b1a', '5a99a46a-31b3-4798-8224-74ce3585d41c', 'AI-Powered Health Monitoring App', 'A mobile application that uses AI to monitor vital signs through the phone''s camera, providing real-time health insights and alerts. Connects users with doctors for virtual consultations.', 'Complete details of the AI Health Monitoring App...', 'Healthcare', '26L-1CR', 'High', 'prototype_path_2.pdf', 320),
('d4a7c1b2-a3d4-4e6f-8a9b-7d6e5f4c3b2a', 'a8e7a6e4-4d2c-4b13-9c86-64c8f2d4a7c1', 'Smart Logistics Platform', 'An integrated platform that optimizes supply chain management using IoT and machine learning. Features real-time tracking, predictive analytics for delivery times, and automated warehousing solutions.', 'Full proposal for the Smart Logistics Platform...', 'Tech', '1CR+', 'High', 'prototype_path_3.pdf', 450),
('e9b8d7c6-f5a4-4b3c-2d1e-0f9a8b7c6d5e', 'd2e3f4c1-9b8e-4a7d-8c6f-5b4a3c2d1e0f', 'Adaptive Learning for Kids', 'An online platform that uses adaptive learning technology to create personalized math and science curricula for K-8 students.', 'Full text for Adaptive Learning for Kids...', 'EdTech', '5L-25L', 'Medium', 'prototype_path_4.pdf', 210),
('f1a0b9c8-d7e6-4f5a-3b2c-1d0e9f8a7b6c', 'c1b2a3d4-8e7f-4c6a-9b5d-4a3c2d1e0f9b', 'Artisanal Coffee Subscription Box', 'A direct-to-consumer subscription service for ethically sourced, single-origin artisanal coffee from across India. Includes stories from the coffee estates.', 'Full text for Artisanal Coffee Subscription Box...', 'Consumer Goods', '70K-5L', 'Less', 'prototype_path_5.pdf', 85);
