-- ══════════════════════════════════════════════════════════════
-- بيّن — تفعيل الحسابات يدويًا من قاعدة البيانات مباشرة
-- شغّل هذا الملف مرة واحدة في: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════
-- بعد التشغيل، طريقة الاستخدام:
--   Table Editor → approved_emails → Insert row
--   email = إيميل الشخص | days = عدد أيام الاشتراك
--   ثم احفظ. لا حاجة لأي شيء آخر.
--
--   - إن كان الشخص مسجَّلاً مسبقًا في المنصة → يتفعّل خلال ثوانٍ
--     (أول تسجيل دخول له بعدها، أو خلال الفحص الدوري كل 10 ثوانٍ
--     إن كان جالسًا في المنصة أصلًا على شاشة "انتظار الدفع").
--   - إن لم يكن مسجَّلاً بعد → يبقى الصف بانتظاره، ويتفعّل تلقائيًا
--     أول لحظة يسجّل فيها دخوله بنفس الإيميل بالضبط.
-- ══════════════════════════════════════════════════════════════

-- 1) جدول الإيميلات المفعَّلة يدويًا
create table if not exists public.approved_emails (
  email text primary key,
  days integer not null default 30,
  note text,
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

-- تفعيل RLS بدون أي سياسات = لا أحد يقدر يقرأ/يكتب هذا الجدول
-- عبر الـ API العام (لا anon ولا authenticated). أنت فقط عبر
-- لوحة Supabase (Table Editor / SQL Editor) تقدر تتحكم فيه،
-- لأن لوحة Supabase تستخدم صلاحيات كاملة تتجاوز RLS.
alter table public.approved_emails enable row level security;

-- 2) دالة تُستدعى تلقائيًا من الموقع بعد كل تسجيل دخول/إنشاء حساب
--    لتفعّل الحساب فورًا إذا كان إيميله موجودًا في الجدول أعلاه.
--    (SECURITY DEFINER تجعلها تتجاوز RLS داخليًا لتقرأ الجدول
--    المحمي وتحدّث profiles، لكنها لا تُفعِّل إلا حساب المستخدم
--    الحالي نفسه — لا يمكن استغلالها لتفعيل حساب غيره)
create or replace function public.try_auto_activate()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
  v_uid   uuid := auth.uid();
  v_row   public.approved_emails;
  v_expires timestamptz;
begin
  if v_uid is null or v_email = '' then
    return 'no-user';
  end if;

  select * into v_row from public.approved_emails
    where email = v_email and consumed_at is null
    limit 1;

  if not found then
    return 'not-approved';
  end if;

  v_expires := now() + (v_row.days || ' days')::interval;

  update public.profiles
    set subscription_status = 'active',
        subscription_expires_at = v_expires,
        email = v_email
    where id = v_uid;

  update public.approved_emails set consumed_at = now() where email = v_email;

  return 'activated';
end;
$$;

grant execute on function public.try_auto_activate() to authenticated;

-- ══════════════════════════════════════════════════════════════
-- انتهى. الآن كل ما عليك: إضافة صف يدويًا في جدول approved_emails
-- من لوحة Supabase (Table Editor) في أي وقت — قبل أو بعد أن
-- يسجّل الشخص حسابه — وسيتفعّل تلقائيًا.
-- ══════════════════════════════════════════════════════════════
