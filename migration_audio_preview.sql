-- PARTNERS CORP · MIGRACIÓN AUDIO PREVIEW
-- Ejecutar en Supabase SQL Editor si ya ejecutaste el schema anterior.

alter table public.talentos add column if not exists audio_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audios', 'audios', true, 8388608,
  array['audio/mpeg','audio/wav','audio/ogg','audio/webm','audio/mp4','audio/x-m4a']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Audios storage lectura autenticada" on storage.objects;
drop policy if exists "Audios storage subir" on storage.objects;
drop policy if exists "Audios storage actualizar" on storage.objects;
drop policy if exists "Audios storage eliminar" on storage.objects;

create policy "Audios storage lectura autenticada" on storage.objects for select to authenticated using (bucket_id = 'audios');
create policy "Audios storage subir" on storage.objects for insert to authenticated with check (bucket_id = 'audios');
create policy "Audios storage actualizar" on storage.objects for update to authenticated using (bucket_id = 'audios') with check (bucket_id = 'audios');
create policy "Audios storage eliminar" on storage.objects for delete to authenticated using (bucket_id = 'audios');
