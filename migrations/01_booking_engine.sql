-- 1. Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_mins INT NOT NULL DEFAULT 30,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Staff (Barbers)
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Staff Services (Dynamic Pricing)
CREATE TABLE public.staff_services (
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  custom_price NUMERIC(10,2),
  custom_duration_mins INT,
  PRIMARY KEY (staff_id, service_id)
);

-- 4. Working Hours
CREATE TABLE public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL, 
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (staff_id, day_of_week) 
);

-- 5. Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Setup
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Public read staff_services" ON public.staff_services FOR SELECT USING (true);
CREATE POLICY "Public read working_hours" ON public.working_hours FOR SELECT USING (true);
CREATE POLICY "Public read appointments" ON public.appointments FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.is_tenant_owner(t_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.tenants WHERE id = t_id AND owner_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Owners manage services" ON public.services FOR ALL USING (is_tenant_owner(tenant_id));
CREATE POLICY "Owners manage staff" ON public.staff FOR ALL USING (is_tenant_owner(tenant_id));
CREATE POLICY "Owners manage staff_services" ON public.staff_services FOR ALL USING (EXISTS(SELECT 1 FROM public.staff WHERE id = staff_services.staff_id AND is_tenant_owner(tenant_id)));
CREATE POLICY "Owners manage working_hours" ON public.working_hours FOR ALL USING (is_tenant_owner(tenant_id));
CREATE POLICY "Owners manage appointments" ON public.appointments FOR ALL USING (is_tenant_owner(tenant_id));

-- 6. Booking RPC
CREATE OR REPLACE FUNCTION public.book_appointment(
  p_tenant_id UUID,
  p_staff_id UUID,
  p_service_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_total_price NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appointment_id UUID;
BEGIN
  PERFORM 1 FROM public.staff WHERE id = p_staff_id FOR UPDATE;

  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE staff_id = p_staff_id
      AND status != 'cancelled'
      AND start_time < p_end_time
      AND end_time > p_start_time
  ) THEN
    RAISE EXCEPTION 'COLLISION: Ese horario ya fue reservado.';
  END IF;

  INSERT INTO public.appointments (
    tenant_id, staff_id, service_id, customer_name, customer_phone, start_time, end_time, total_price, status
  ) VALUES (
    p_tenant_id, p_staff_id, p_service_id, p_customer_name, p_customer_phone, p_start_time, p_end_time, p_total_price, 'confirmed'
  ) RETURNING id INTO v_appointment_id;

  RETURN v_appointment_id;
END;
$$;
