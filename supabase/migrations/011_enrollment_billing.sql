-- Module 8: Enrollment & Billing (Full Plan Schema)

-- Enrollments
create table public.enrollments (
    id                   uuid primary key default gen_random_uuid(),
    member_id            uuid not null references public.members(id) on delete cascade,
    customer_id          uuid not null references public.profiles(id) on delete cascade,
    product_variant_id   uuid not null references public.product_variants(id),
    location_id          uuid not null references public.locations(id),
    ownership_id         uuid not null references public.ownerships(id),
    offering_price       numeric(10,2) not null,
    status               varchar(20) not null default 'active'
                           check (status in ('active','cancelled','suspended')),
    enrolled_at          timestamptz not null default now(),
    cancelled_at         timestamptz,
    cancellation_reason  text
);

-- Enrollment Batches (Multi-slot support)
create table public.enrollment_batches (
    id            uuid primary key default gen_random_uuid(),
    enrollment_id uuid not null references public.enrollments(id) on delete cascade,
    batch_id      uuid not null references public.batches(id),
    created_at    timestamptz not null default now(),
    unique (enrollment_id, batch_id)
);

-- Payment Methods (Stripe tracking)
create table public.payment_methods (
    id            uuid primary key default gen_random_uuid(),
    customer_id   uuid not null references public.profiles(id) on delete cascade,
    stripe_pm_id  varchar(255) not null unique,
    last4         varchar(4) not null,
    card_brand    varchar(30) not null,
    exp_month     smallint not null,
    exp_year      smallint not null,
    is_default    boolean not null default false,
    created_at    timestamptz not null default now()
);

-- Invoices
create table public.invoices (
    id                   uuid primary key default gen_random_uuid(),
    customer_id          uuid not null references public.profiles(id) on delete cascade,
    ownership_id         uuid not null references public.ownerships(id),
    payment_method_id    uuid references public.payment_methods(id),
    amount               numeric(10,2) not null,
    discount             numeric(10,2) not null default 0,
    tax                  numeric(10,2) not null default 0,
    total                numeric(10,2) not null,
    status               varchar(20) not null default 'pending'
                           check (status in ('pending','paid','failed','refunded','waived')),
    due_date             date not null,
    billing_period_start date not null,
    billing_period_end   date not null,
    stripe_pi_id         varchar(255),
    notes                text,
    issued_at            timestamptz not null default now(),
    paid_at              timestamptz
);

-- Invoice Line Items
create table public.invoice_line_items (
    id              uuid primary key default gen_random_uuid(),
    invoice_id      uuid not null references public.invoices(id) on delete cascade,
    enrollment_id   uuid references public.enrollments(id),
    description     text not null,
    amount          numeric(10,2) not null,
    discount_amount numeric(10,2) not null default 0,
    reference_type  varchar(30) not null
                      check (reference_type in ('enrollment','setup_fee','trial','adjustment')),
    reference_id    uuid
);

-- Discount Tiers
create table public.discount_tiers (
    id            uuid primary key default gen_random_uuid(),
    planets_count smallint not null unique,
    discount_pct  numeric(5,2) not null,
    is_active     boolean not null default true,
    created_at    timestamptz not null default now()
);

-- RLS
alter table public.enrollments enable row level security;
alter table public.enrollment_batches enable row level security;
alter table public.payment_methods enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.discount_tiers enable row level security;

-- Policies (Simplified for broad admin access, scoped for customers)
create policy "admin_all_enrollments" on public.enrollments for all using (true);
create policy "admin_all_invoices" on public.invoices for all using (true);
create policy "admin_all_payments" on public.payment_methods for all using (true);
create policy "admin_all_line_items" on public.invoice_line_items for all using (true);
create policy "admin_all_discounts" on public.discount_tiers for all using (true);

create policy "customer_own_enrollments" on public.enrollments for select
  using (customer_id = auth.uid());

create policy "customer_own_invoices" on public.invoices for select
  using (customer_id = auth.uid());

