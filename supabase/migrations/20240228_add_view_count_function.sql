-- Drop existing function if it exists
drop function if exists increment_article_views(uuid);

-- Drop existing policy if it exists
drop policy if exists "Users can increment view counts" on kb_articles;

-- Add view_count column to kb_articles table if it doesn't exist
do $$ 
begin
  if not exists (
    select from information_schema.columns 
    where table_name = 'kb_articles' and column_name = 'view_count'
  ) then
    alter table kb_articles add column view_count integer default 0;
  end if;
end $$;

-- Create function to increment article views
create or replace function increment_article_views(article_id uuid)
returns setof kb_articles
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update kb_articles
  set view_count = coalesce(view_count, 0) + 1,
      metadata = jsonb_set(
        coalesce(metadata, '{}'::jsonb),
        '{last_viewed_at}',
        to_jsonb(now())
      )
  where id = article_id
  returning *;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function increment_article_views(uuid) to authenticated;

-- Add RLS policy for view count updates
create policy "Users can increment view counts"
  on kb_articles
  for update
  using (true)  -- Allow all authenticated users to increment view counts
  with check (true);  -- No additional checks needed since function is security definer 