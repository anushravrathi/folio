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
  open_to_work boolean default true,
  is_pro boolean default false,
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

-- Analytics
create table page_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  viewed_at timestamp default now(),
  source text, -- referrer
  country text
);

create table link_clicks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  link_type text, -- 'github' | 'linkedin' | 'project' | 'email' etc
  clicked_at timestamp default now()
);

-- Setup Row Level Security (RLS)
-- (Add policies as needed for security, e.g., users can only update their own profile)
