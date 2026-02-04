-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Linked to Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  name text,
  height numeric, -- in cm
  weight numeric, -- in kg
  goal_calories integer default 2000,
  macro_split jsonb default '{"protein": 30, "carbs": 40, "fats": 30}'::jsonb
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Food Logs Table (Daily Summary)
create table food_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  total_calories integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, date)
);

alter table food_logs enable row level security;

create policy "Users can view own logs."
  on food_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert own logs."
  on food_logs for insert
  with check ( auth.uid() = user_id );

-- 3. Meal Entries Table (Individual Items)
create table meal_entries (
  id uuid default uuid_generate_v4() primary key,
  log_id uuid references food_logs(id) on delete cascade,
  meal_type text check (meal_type in ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  food_name text not null,
  calories integer not null,
  protein numeric default 0,
  carbs numeric default 0,
  fats numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table meal_entries enable row level security;

create policy "Users can view own entries via log_id."
  on meal_entries for select
  using ( exists ( select 1 from food_logs where id = meal_entries.log_id and user_id = auth.uid() ) );

create policy "Users can insert entries via log_id."
  on meal_entries for insert
  with check ( exists ( select 1 from food_logs where id = meal_entries.log_id and user_id = auth.uid() ) );
