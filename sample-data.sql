-- Sample Test Data for Pagination Testing
-- Copy and paste this AFTER creating the main table
-- This will add 8 sample stories to test pagination

-- Insert sample Local stories
INSERT INTO travel_stories (title, category, story_content, location, travel_date) VALUES
('Sunrise at Jarugumalai', 'local', 'When it was the sunrise time in Salem, I got a bike ride in a Thunderbird to go to Jarugumalai, a small hamlet in Salem. The journey was absolutely breathtaking with misty mountains and fresh morning air.', 'Salem, Tamil Nadu', '2024-03-15'),
('Palakkad Fort Adventure', 'local', 'Visited the historical fort of Tipu at Palakkad City in Kerala. The architecture and history behind this fort is truly amazing. The stone work and defensive structures show the engineering excellence of that era.', 'Palakkad, Kerala', '2024-02-20'),
('Pudhu Eri Exploration', 'local', 'An amazing travel story of a wanderer exploring hidden gems nearby. This small lake surrounded by lush greenery offers a perfect escape from city life. The sunset view from here is simply magical.', 'Coimbatore, Tamil Nadu', '2024-01-10'),
('Local Market Discovery', 'local', 'Exploring the traditional local market early in the morning. The vibrant colors of fresh produce, the sounds of vendors, and the authentic local cuisine made this experience unforgettable.', 'Salem, Tamil Nadu', '2023-12-05'),
('Hidden Temple Trek', 'local', 'Discovered a centuries-old temple hidden in the hills during a weekend trek. The peaceful environment and ancient architecture provided a spiritual journey unlike any other.', 'Namakkal, Tamil Nadu', '2023-11-18'),
('River Bank Evening', 'local', 'Spent a perfect evening by the river bank watching the sunset. The gentle flow of water and the chorus of evening birds created a symphony of nature.', 'Krishnagiri, Tamil Nadu', '2023-10-22'),
('Mountain Village Experience', 'local', 'Stayed overnight in a remote mountain village where hospitality knows no bounds. The simple life and genuine warmth of the locals reminded me of what truly matters.', 'Yercaud, Tamil Nadu', '2023-09-14'),
('Local Festival Celebration', 'local', 'Participated in a traditional local festival filled with music, dance, and delicious homemade food. The community spirit and cultural richness left me spellbound.', 'Erode, Tamil Nadu', '2023-08-30');

-- Insert sample Interstate stories
INSERT INTO travel_stories (title, category, story_content, location, travel_date) VALUES
('Fort Kochi Beach Experience', 'interstate', 'It was a sunny noon when I reached Fort Kochi beach through multiple modes of transport like Rail, Metro, Diesel Boats. The serene beach and historical fort made this journey worthwhile.', 'Kochi, Kerala', '2024-04-10'),
('Kozhikode Unplanned Adventure', 'interstate', 'As of a sudden trip, I was off to Kozhikkode (a) Calicut, where the Voyager Vasco-da-Gama ship reached Indian Subcontinent. The historical significance of this place is remarkable.', 'Kozhikode, Kerala', '2024-03-25'),
('Mysore Palace Grandeur', 'interstate', 'Visited the magnificent Mysore Palace with its stunning architecture and royal history. The intricate carvings and grand halls showcase the rich cultural heritage of Karnataka.', 'Mysore, Karnataka', '2024-02-14'),
('Goa Beach Paradise', 'interstate', 'Experienced the pristine beaches of Goa with golden sand and clear blue waters. The seafood and coastal culture added to the charm of this coastal paradise.', 'Goa, India', '2024-01-28'),
('Hampi Ruins Journey', 'interstate', 'Explored the ancient ruins of Hampi, once the capital of Vijayanagara Empire. The massive boulders and intricate temple architecture tell stories of a glorious past.', 'Hampi, Karnataka', '2023-12-20'),
('Leh-Ladakh Adventure', 'interstate', 'The ultimate high-altitude adventure with breathtaking landscapes of snow-capped mountains and pristine lakes. The challenging journey was rewarded with unforgettable views.', 'Leh, Ladakh', '2023-11-05'),
('Rajasthan Desert Safari', 'interstate', 'Experienced the vast Thar Desert with camel safari and traditional Rajasthani hospitality. The starry night sky and cultural performances made this journey magical.', 'Jaisalmer, Rajasthan', '2023-10-15'),
('Kerala Backwaters Cruise', 'interstate', 'Cruised through the serene backwaters of Kerala in a traditional houseboat. The lush green landscapes and peaceful waterways offered perfect relaxation.', 'Alleppey, Kerala', '2023-09-08');

-- Insert sample International stories
INSERT INTO travel_stories (title, category, story_content, location, travel_date) VALUES
('European Backpack Journey', 'international', 'Wanna travel more like air! This incredible journey through Europe opened my eyes to diverse cultures, languages, and histories. From the romantic streets of Paris to the historic ruins of Rome.', 'Europe', '2024-05-20'),
('Southeast Asia Adventure', 'international', 'Exploring the vibrant markets of Thailand, the pristine beaches of Malaysia, and the rich culture of Vietnam. Each country offered unique experiences and unforgettable memories.', 'Southeast Asia', '2024-04-05'),
('American Road Trip', 'international', 'Cross-country road trip from New York to Los Angeles, experiencing the diverse landscapes and cultures of America. The Grand Canyon and Route 66 were absolute highlights.', 'USA', '2023-11-12'),
('Australian Outback Experience', 'international', 'Venturing into the heart of Australia''s outback where ancient rock formations and unique wildlife create a surreal landscape. The starlit skies are beyond description.', 'Australia', '2023-10-03'),
('Japanese Cultural Immersion', 'international', 'Immersed in Japanese culture through tea ceremonies, temple visits, and traditional festivals. The respect for tradition and modern innovation creates a unique harmony.', 'Japan', '2023-08-18'),
('African Safari Adventure', 'international', 'Witnessed the Big Five wildlife in their natural habitat during an incredible safari adventure. The raw beauty of African savannas and the Great Migration was breathtaking.', 'Kenya & Tanzania', '2023-07-25'),
('Scandinavian Winter Escape', 'international', 'Experienced the magical northern lights and winter sports in Scandinavia. The cozy cabin stays and hearty local cuisine made it a perfect winter getaway.', 'Norway & Sweden', '2023-06-30'),
('South American Trek', 'international', 'Trekking through the Andes and exploring ancient Incan ruins in Peru and Bolivia. The mountain vistas and rich indigenous cultures created an adventure of a lifetime.', 'Peru & Bolivia', '2023-05-15');

-- Insert sample Speechless People stories
INSERT INTO travel_stories (title, category, story_content, location, travel_date) VALUES
('The Kind Shopkeeper', 'speechless_people', 'A beautiful soul I met during my travels who taught me the meaning of pure kindness and joy. Despite having so little, he shared his meager meal with a hungry stranger without hesitation.', 'Local Train Station', '2024-03-08'),
('The Helpful Stranger', 'speechless_people', 'A stranger who helped me when I was lost in an unfamiliar city, showing me that humanity still exists in its purest form. He not only gave directions but also walked me to my destination.', 'Mumbai, Maharashtra', '2024-02-16'),
('The Wise Tea Vendor', 'speechless_people', 'An elderly person I met at a local tea stall who shared life lessons that left me speechless and grateful. His words about simplicity and contentment resonated deeply with me.', 'Kashmir, India', '2024-01-12'),
('The Street Artist', 'speechless_people', 'Met a talented street artist who painted beautiful murals despite having no formal training or proper tools. His passion and dedication reminded me that talent needs no recognition.', 'Kolkata, West Bengal', '2023-12-08'),
('The Fishing Family', 'speechless_people', 'Spent time with a humble fishing family whose joy and gratitude for life''s simple pleasures was infectious. Their children''s laughter and the family''s unity was truly inspiring.', 'Kerala Coast', '2023-11-20'),
('The Mountain Guide', 'speechless_people', 'A local mountain guide who risked his life to help stranded travelers without expecting anything in return. His courage and selflessness during the rescue operation was heroic.', 'Himalayas', '2023-10-05'),
('The Temple Helper', 'speechless_people', 'Discovered a volunteer who spends every day maintaining an ancient temple without any pay. His devotion and pride in preserving history touched my heart profoundly.', 'Tirupati, Andhra Pradesh', '2023-09-18'),
('The Bus Driver', 'speechless_people', 'A bus driver who remembered every passenger''s destination and made sure everyone reached safely, especially the elderly and children. His care and attention to detail was remarkable.', 'National Highway', '2023-08-25');