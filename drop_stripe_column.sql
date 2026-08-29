-- حذف عمود stripe_customer_id غير المستخدَم من جدول profiles
-- (باقٍ من نظام دفع قديم — غير مرتبط بأي كود في المنصة حاليًا)

alter table public.profiles
  drop column if exists stripe_customer_id;
