-- Create users table profile mirroring auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  username text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create trigger to automatically create a profile when a new user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Debts Table
create table public.debts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  description text not null,
  amount numeric(10,2) not null,
  status text default 'pending' check (status in ('pending', 'paid')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.debts enable row level security;

create policy "Users can view their own debts"
  on debts for select
  using ( auth.uid() = user_id );

create policy "Admins can view/edit all debts"
  on debts for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- Ticket Requests Table
create table public.ticket_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  event_name text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ticket_requests enable row level security;

create policy "Users can view their own requests"
  on ticket_requests for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own requests"
  on ticket_requests for insert
  with check ( auth.uid() = user_id );

create policy "Admins can view/edit all requests"
  on ticket_requests for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
