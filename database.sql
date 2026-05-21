-- Users table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  full_name text,
  title text,
  about text,
  location text,
  email text,
  avatar_url text,
  cv_url text,
  open_to_work boolean default true,
  is_pro boolean default false,
  is_deployed boolean default false,
  deployed_at timestamp,
  custom_domain text,
  theme text default 'dark',
  font text default 'geist',
  created_at timestamp default now()
);

-- Skills
create table skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  icon_key text, -- e.g. "react", "python", "nextjs"
  sort_order int default 0
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  icon text default '🚀',
  github_url text,
  live_url text,
  status text default 'live', -- 'building' | 'live' | 'discontinued'
  sort_order int default 0,
  created_at timestamp default now()
);

-- Experience
create table experience (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  company_name text not null,
  company_domain text, -- for clearbit logo e.g. "google.com"
  role text not null,
  type text default 'internship', -- 'internship' | 'fulltime' | 'parttime' | 'freelance'
  start_month text, -- e.g. "May 2024"
  end_month text, -- null if current
  is_current boolean default false,
  description text,
  sort_order int default 0
);

-- Social links
create table social_links (
  id uuid references profiles(id) primary key,
  github text,
  linkedin text,
  twitter text,
  leetcode text,
  instagram text,
  website text
);

-- Analytics: Page Views
create table page_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  viewed_at timestamp default now(),
  source text, -- referrer
  country text
);

-- Analytics: Link Clicks
create table link_clicks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  link_type text, -- 'github' | 'linkedin' | 'project' | 'email' | 'cv_download' etc
  clicked_at timestamp default now()
);

-- Analytics: Profile Shares
create table profile_shares (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  shared_at timestamp default now(),
  method text -- 'copy_link' | 'twitter' | 'linkedin' | 'whatsapp' | 'native'
);

-- Setup Row Level Security (RLS)
-- (Add policies as needed for security, e.g., users can only update their own profile)

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table skills enable row level security;
alter table projects enable row level security;
alter table experience enable row level security;
alter table social_links enable row level security;
alter table page_views enable row level security;
alter table link_clicks enable row level security;
alter table profile_shares enable row level security;

-- Profiles: users can read any profile, only update their own
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Skills, Projects, Experience: viewable by everyone, editable by owner
create policy "Public skills" on skills for select using (true);
create policy "Owner can manage skills" on skills for all using (auth.uid() = profile_id);

create policy "Public projects" on projects for select using (true);
create policy "Owner can manage projects" on projects for all using (auth.uid() = profile_id);

create policy "Public experience" on experience for select using (true);
create policy "Owner can manage experience" on experience for all using (auth.uid() = profile_id);

-- Social links: viewable by everyone, editable by owner
create policy "Public social links" on social_links for select using (true);
create policy "Owner can manage social links" on social_links for all using (auth.uid() = id);

-- Analytics: insertable by anyone (for tracking), readable by profile owner
create policy "Anyone can insert page views" on page_views for insert with check (true);
create policy "Owner can read page views" on page_views for select using (auth.uid() = profile_id);

create policy "Anyone can insert link clicks" on link_clicks for insert with check (true);
create policy "Owner can read link clicks" on link_clicks for select using (auth.uid() = profile_id);

create policy "Anyone can insert shares" on profile_shares for insert with check (true);
create policy "Owner can read shares" on profile_shares for select using (auth.uid() = profile_id);

-- Performance Optimization Indexes
-- 1. Optimize Next.js Edge custom domain resolution
create index if not exists idx_profiles_custom_domain on profiles(custom_domain);

-- 2. Optimize standard foreign key relational queries
create index if not exists idx_skills_profile_id on skills(profile_id);
create index if not exists idx_projects_profile_id on projects(profile_id);
create index if not exists idx_experience_profile_id on experience(profile_id);

-- 3. Optimize analytics queries with composite indexes on profile_id and timestamps
create index if not exists idx_page_views_profile_id_viewed_at on page_views(profile_id, viewed_at);
create index if not exists idx_link_clicks_profile_id_clicked_at on link_clicks(profile_id, clicked_at);
create index if not exists idx_profile_shares_profile_id_shared_at on profile_shares(profile_id, shared_at);
