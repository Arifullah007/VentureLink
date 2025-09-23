-- VentureLink Demo Mode Seed Data
-- This script clears and repopulates the database with sample data for showcase purposes.

-- Clear existing data in the correct order to avoid foreign key constraints
DELETE FROM public.messages;
DELETE FROM public.deal_rooms;
DELETE FROM public.reports;
DELETE FROM public.idea_files;
DELETE FROM public.investor_subscriptions;
DELETE FROM public.ideas;
DELETE FROM public.profiles;

-- Note: We are not deleting auth.users to keep the login credentials stable.
-- The seed script will create users if they don't exist. The passwords are all 'password123'.

--
-- Seed Profiles (Entrepreneurs & Investors)
--
-- Note: The UUIDs for users are hardcoded here to match the users created in the seed_demo.ts script.
-- This ensures that the profiles are correctly linked to the auth users.

-- Entrepreneurs
INSERT INTO public.profiles (id, full_name, role, bio, updated_at) VALUES
('5a99a46a-31b3-4798-8224-74ce3585d41c', 'Rohan Kumar', 'entrepreneur', 'Serial innovator with a passion for sustainable technology. Previously founded a successful cleantech startup.', NOW()),
('3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7', 'Isha Reddy', 'entrepreneur', 'AI and ML expert focused on democratizing healthcare through technology. PhD in Computer Science.', NOW()),
('a8e7a6e4-4d2c-4b13-9c86-64c8f2d4a7c1', 'Arjun Singh', 'entrepreneur', 'Fintech enthusiast aiming to build the next generation of financial tools for the gig economy.', NOW()),
('d2e3f4c1-9b8e-4a7d-8c6f-5b4a3c2d1e0f', 'Meera Patel', 'entrepreneur', 'D2C brand specialist with a knack for creating viral consumer products. Expertise in social media marketing.', NOW()),
('c1b2a3d4-8e7f-4c6a-9b5d-4a3c2d1e0f9b', 'Karan Chopra', 'entrepreneur', 'Experienced educator and technologist building adaptive learning platforms for K-12.', NOW());

-- Investors
INSERT INTO public.profiles (id, full_name, role, bio, linkedin_url, website_url, updated_at) VALUES
('b9d8c7e6-5f4a-4b3c-2d1e-0f9a8b7c6d5e', 'Priya Sharma', 'investor', 'Early-stage tech investor focusing on SaaS and AI. Former product manager at a top tech firm. I look for strong teams with a clear vision.', 'https://linkedin.com/in/priyasharma', 'https://sharmaventures.com', NOW()),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Vikram Mehta', 'investor', 'VC specializing in biotech and digital health. Searching for disruptive healthcare solutions with strong IP.', 'https://linkedin.com/in/vikrammehta', 'https://mehtacapital.com', NOW()),
('f5e4d3c2-b1a0-9c8d-7e6f-5a4b3c2d1e0f', 'Anjali Gupta', 'investor', 'Angel investor passionate about sustainable consumer products and D2C brands. Brand-first approach.', 'https://linkedin.com/in/anjaligupta', NULL, NOW()),
('d4c3b2a1-e0f9-a8b7-c6d5-e4f3a2b1c0d9', 'Ravi Kapoor', 'investor', 'Ex-banker funding the next wave of fintech. Interested in blockchain, neobanking, and payment platforms.', 'https://linkedin.com/in/ravikapoor', 'https://kapoor.investments', NOW());

--
-- Seed Ideas (formerly Pitches)
--
INSERT INTO public.ideas (id, entrepreneur_id, idea_title, anonymized_summary, full_text, sector, investment_required, estimated_returns, views, created_at, updated_at) VALUES
('a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', '5a99a46a-31b3-4798-8224-74ce3585d41c', 'Project GreenCycle', 'A closed-loop recycling system for urban areas using smart bins and a rewards-based mobile app.', 'Full details of Project GreenCycle...', 'Sustainability', '5L-25L', 'Medium', 25, NOW(), NOW()),
('b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', '3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7', 'HealthAI Diagnostics', 'AI-powered platform for early-stage disease detection from medical imaging, improving accuracy and speed.', 'Full details of HealthAI Diagnostics...', 'Healthcare', '26L-1CR', 'High', 42, NOW(), NOW()),
('c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', 'a8e7a6e4-4d2c-4b13-9c86-64c8f2d4a7c1', 'GigFinance SecurePay', 'A neobank for gig economy workers offering instant payments, micro-loans, and automated tax withholding.', 'Full details of GigFinance SecurePay...', 'Fintech', '26L-1CR', 'High', 15, NOW(), NOW()),
('d4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', 'd2e3f4c1-9b8e-4a7d-8c6f-5b4a3c2d1e0f', 'Native Roots Organics', 'A D2C brand for certified organic skincare products sourced ethically from local farmers in the Himalayas.', 'Full details of Native Roots Organics...', 'Consumer Goods', '70K-5L', 'Less', 88, NOW(), NOW()),
('e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', 'c1b2a3d4-8e7f-4c6a-9b5d-4a3c2d1e0f9b', 'TutorBot Academy', 'An AI-driven adaptive learning platform for high school students, providing personalized tutoring for competitive exams.', 'Full details of TutorBot Academy...', 'EdTech', '5L-25L', 'Medium', 33, NOW(), NOW()),
('f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1', '5a99a46a-31b3-4798-8224-74ce3585d41c', 'AquaPure Home', 'A smart water purifier that uses UV-C LED technology and IoT to provide real-time water quality data to a mobile app.', 'Full details of AquaPure Home...', 'Tech', '70K-5L', 'Medium', 67, NOW(), NOW());

--
-- Seed Idea Files (linking files to ideas)
--
INSERT INTO public.idea_files (idea_id, file_name, file_path, watermarked, watermarked_path, quarantined) VALUES
('a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', 'greencycle_deck.pdf', '5a99a46a-31b3-4798-8224-74ce3585d41c/greencycle_deck.pdf', true, 'processed/5a99a46a-31b3-4798-8224-74ce3585d41c/greencycle_deck.pdf', false),
('b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', 'healthai_prototype.jpg', '3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7/healthai_prototype.jpg', true, 'processed/3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7/healthai_prototype.jpg', false),
('d4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', 'quarantined_file.pdf', 'd2e3f4c1-9b8e-4a7d-8c6f-5b4a3c2d1e0f/quarantined_file.pdf', false, NULL, true); -- This file is quarantined

--
-- Seed Investor Subscriptions
--
INSERT INTO public.investor_subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, plan_name, current_period_end) VALUES
('b9d8c7e6-5f4a-4b3c-2d1e-0f9a8b7c6d5e', 'cus_demo_priya', 'sub_demo_priya', 'active', 'High Return', (NOW() + interval '1 month')),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'cus_demo_vikram', 'sub_demo_vikram', 'active', 'High Return', (NOW() + interval '1 month')),
('f5e4d3c2-b1a0-9c8d-7e6f-5a4b3c2d1e0f', 'cus_demo_anjali', 'sub_demo_anjali', 'active', 'Medium Scale', (NOW() + interval '1 month')),
('d4c3b2a1-e0f9-a8b7-c6d5-e4f3a2b1c0d9', 'cus_demo_ravi', 'sub_demo_ravi', 'active', 'Small Scale', (NOW() + interval '1 month'));

--
-- Seed Deal Rooms (NDA signed collaborations)
--
INSERT INTO public.deal_rooms (id, idea_id, investor_id, nda_signed_at) VALUES
('dr_1', 'b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', 'b9d8c7e6-5f4a-4b3c-2d1e-0f9a8b7c6d5e', NOW()), -- Priya (Investor) and HealthAI (Idea)
('dr_2', 'e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', 'f5e4d3c2-b1a0-9c8d-7e6f-5a4b3c2d1e0f', NOW()); -- Anjali (Investor) and TutorBot (Idea)

--
-- Seed Messages
--
INSERT INTO public.messages (deal_room_id, sender_id, content) VALUES
('dr_1', 'b9d8c7e6-5f4a-4b3c-2d1e-0f9a8b7c6d5e', 'Hi Isha, very impressive work on the HealthAI prototype. Could you share more details on your clinical validation strategy?'),
('dr_1', '3f58a74e-7b70-4f51-9c64-41b1a7d7b6e7', 'Thanks, Priya! We''re currently in talks with two major hospitals for a pilot study. I can share the preliminary proposal with you.'),
('dr_2', 'f5e4d3c2-b1a0-9c8d-7e6f-5a4b3c2d1e0f', 'Karan, your adaptive learning model seems promising. What''s your user acquisition cost projection?'),
('dr_2', 'c1b2a3d4-8e7f-4c6a-9b5d-4a3c2d1e0f', 'Anjali, we have a B2B2C model targeting coaching centers first, which brings CAC down significantly. Our projection is around ₹350 per student initially.');

--
-- Seed Reports (Violations)
--
INSERT INTO public.reports (report_type, description, related_idea_id, related_user_id, status) VALUES
('contact_info_in_summary', 'Entrepreneur included email in pitch summary.', 'c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', 'a8e7a6e4-4d2c-4b13-9c86-64c8f2d4a7c1', 'pending_review'),
('contact_info_in_file', 'Uploaded file for "Native Roots Organics" contained an email address.', 'd4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', 'd2e3f4c1-9b8e-4a7d-8c6f-5b4a3c2d1e0f', 'resolved');

--
-- Enable Row Level Security (if not already enabled)
--
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
