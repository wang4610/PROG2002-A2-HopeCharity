CREATE DATABASE IF NOT EXISTS charityevents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE charityevents_db;

DROP TABLE IF EXISTS charity_events;
DROP TABLE IF EXISTS event_categories;
DROP TABLE IF EXISTS charity_organisations;

CREATE TABLE charity_organisations (
  org_id INT AUTO_INCREMENT PRIMARY KEY,
  org_name VARCHAR(120) NOT NULL,
  mission TEXT,
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  org_logo_url VARCHAR(255)
);

CREATE TABLE event_categories (
  cat_id INT AUTO_INCREMENT PRIMARY KEY,
  cat_name VARCHAR(60) NOT NULL,
  cat_description TEXT
);

CREATE TABLE charity_events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  cat_id INT NOT NULL,
  event_name VARCHAR(150) NOT NULL,
  event_short_desc VARCHAR(300),
  event_full_description TEXT NOT NULL,
  event_date DATETIME NOT NULL,
  location VARCHAR(180) NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  charity_goal_amount DECIMAL(12,2) NOT NULL,
  current_raised DECIMAL(12,2) DEFAULT 0.00,
  event_image_url VARCHAR(255),
  is_suspended TINYINT(1) DEFAULT 0,
  FOREIGN KEY(org_id) REFERENCES charity_organisations(org_id),
  FOREIGN KEY(cat_id) REFERENCES event_categories(cat_id)
);

INSERT INTO charity_organisations(org_name,mission,contact_email,contact_phone,org_logo_url) VALUES
('Hope For Community','We raise funds to support homeless families and children in local communities.','contact@hopecommunity.org','02-5555-1111','https://picsum.photos/id/237/400/200');

INSERT INTO event_categories(cat_name,cat_description) VALUES
('Fun Run','Outdoor running/walking charity sport events'),
('Gala Dinner','Formal evening fundraising dinner'),
('Silent Auction','Silent bidding auction for charity funds'),
('Charity Concert','Live music performance for charity');

INSERT INTO charity_events(org_id,cat_id,event_name,event_short_desc,event_full_description,event_date,location,ticket_price,charity_goal_amount,current_raised,event_image_url,is_suspended) VALUES
(1,1,'City Hope Fun Run 2026','5km community fun run for homeless children','Join our annual 5 KM fun run through city park. All ticket proceeds will provide shelter and food for local homeless children. Come run, walk or jog with family and friends. There will be water stations, medal for finishers and market stalls on site. Every dollar counts toward our community support program.','2026-10-12 08:30:00','Central City Park, Melbourne VIC',25.00,25000.00,12400.00,'https://picsum.photos/id/1060/700/420',0),
(1,2,'Starlight Charity Gala Dinner','Elegant gala night for family support programs','Enjoy fine dining, guest speeches and community recognition night. All donations support low-income family assistance packages. Formal dress required. Drinks and three-course dinner included in ticket price.','2026-11-05 19:00:00','Grand Ballroom, Hilton Sydney NSW',149.00,80000.00,34200.00,'https://picsum.photos/id/1067/700/420',0),
(1,3,'Winter Silent Auction','Bid unique items to fund winter shelter supplies','Silent auction event featuring artworks, holiday packages and gift vouchers. Place your bids throughout the evening, all money raised buys blankets, heating kits for people experiencing homelessness.','2026-10-22 18:00:00','Community Hall, Brisbane QLD',0.00,18000.00,7100.00,'https://picsum.photos/id/1059/700/420',0),
(1,4,'Community Charity Live Concert','Live band performance, free entry with donation','Local musicians volunteer their time for this charity concert. Entry is free, voluntary donation box on site. Help us raise money for youth mental health outreach services.','2026-09-30 17:00:00','Riverside Amphitheatre, Adelaide SA',0.00,12000.00,9800.00,'https://picsum.photos/id/1054/700/420',0),
(1,1,'Autumn Community Walk','Casual walking event for food bank supplies','Easy 3km community walk for all ages. Funds will fill local food-bank pantries for families struggling with cost-of-living pressures. Dog-friendly event.','2026-10-28 09:00:00','Botanic Garden, Perth WA',15.00,10000.00,2200.00,'https://picsum.photos/id/1063/700/420',0),
(1,2,'Harvest Charity Gala','Farm-to-table dinner supporting rural families','Local farm produce dinner night, guest speakers from rural community support services. Help families affected by drought.','2026-12-03 18:30:00','Country Convention Centre, Canberra ACT',129.00,45000.00,18600.00,'https://picsum.photos/id/1068/700/420',0),
(1,3,'Art Pieces Silent Auction','Charity art auction for children education grants','Local artists donate original artworks. Bidding proceeds fund after-school tutoring grants for disadvantaged school children.','2026-11-18 17:30:00','City Art Gallery, Hobart TAS',0.00,14000.00,4300.00,'https://picsum.photos/id/1071/700/420',0),
(1,4,'Youth Charity Rock Night','Rock concert supporting youth housing project','Youth bands perform, all ticket income directed toward temporary youth housing program for at-risk teenagers.','2026-11-25 19:30:00','Metro Live Venue, Gold Coast QLD',39.50,32000.00,11100.00,'https://picsum.photos/id/1074/700/420',0),
(1,1,'Old Fun Run Test Suspended','This event violates policy and suspended','This event should never show up in home page results due to is_suspended=1','2026-08-10 09:00:00','Test Location',10,5000,1200,'https://picsum.photos/id/1080/700/420',1);
