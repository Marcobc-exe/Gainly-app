-- Permite que cada usuario borre su propia cuenta desde la app (Perfil → Eliminar cuenta).
-- Ejecutar una vez en Supabase → SQL Editor. La app la llama con supabase.rpc('eliminar_cuenta').

create or replace function public.eliminar_cuenta()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

-- Solo usuarios con sesión iniciada; cada uno únicamente puede borrar su propia cuenta (auth.uid()).
revoke execute on function public.eliminar_cuenta() from public, anon;
grant execute on function public.eliminar_cuenta() to authenticated;
