create table "public"."campaign_reviews" (
    "id" uuid not null default uuid_generate_v4(),
    "campaign_id" uuid not null,
    "reviewer_id" uuid not null,
    "status" character varying(50) not null,
    "comments" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."campaign_reviews" enable row level security;

create table "public"."categories" (
    "id" uuid not null default uuid_generate_v4(),
    "restaurant_id" uuid not null,
    "name" character varying(255) not null,
    "description" text,
    "image_url" character varying(255),
    "order" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."marketing_campaigns" (
    "id" uuid not null default uuid_generate_v4(),
    "restaurant_id" uuid not null,
    "name" character varying(255) not null,
    "description" text,
    "objective" character varying(100) not null,
    "platforms" jsonb not null,
    "status" character varying(50) not null default 'draft'::character varying,
    "budget" numeric(10,2),
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "target_audience" jsonb,
    "content" jsonb,
    "media_assets" jsonb,
    "results" jsonb,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."marketing_campaigns" enable row level security;

create table "public"."menu_items" (
    "id" uuid not null default uuid_generate_v4(),
    "restaurant_id" uuid not null,
    "category_id" uuid not null,
    "name" character varying(255) not null,
    "description" text,
    "price" numeric(10,2) not null,
    "image_url" character varying(255),
    "options" jsonb,
    "available" boolean default true,
    "featured" boolean default false,
    "order" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "original_price" numeric(10,2)
);


create table "public"."order_items" (
    "id" uuid not null default uuid_generate_v4(),
    "order_id" uuid not null,
    "menu_item_id" uuid not null,
    "quantity" integer not null,
    "price" numeric(10,2) not null,
    "options" jsonb,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."order_items" enable row level security;

create table "public"."order_status_history" (
    "id" uuid not null default uuid_generate_v4(),
    "order_id" uuid not null,
    "status_id" uuid not null,
    "notes" text,
    "updated_by" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."order_statuses" (
    "id" uuid not null default uuid_generate_v4(),
    "name" character varying(50) not null,
    "description" text,
    "color" character varying(7) not null,
    "sort_order" integer not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."order_statuses" enable row level security;

create table "public"."order_tracking" (
    "id" uuid not null default uuid_generate_v4(),
    "order_id" uuid not null,
    "driver_id" uuid,
    "estimated_delivery_time" timestamp with time zone,
    "actual_delivery_time" timestamp with time zone,
    "delivery_notes" text,
    "rating" integer,
    "feedback" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."order_tracking" enable row level security;

create table "public"."orders" (
    "id" uuid not null default uuid_generate_v4(),
    "restaurant_id" uuid not null,
    "user_id" uuid,
    "customer_name" character varying(255) not null,
    "customer_email" character varying(255) not null,
    "customer_phone" character varying(20) not null,
    "delivery_address" text not null,
    "delivery_coordinates" jsonb,
    "items" jsonb not null,
    "subtotal" numeric(10,2) not null,
    "tax" numeric(10,2) not null,
    "delivery_fee" numeric(10,2) not null,
    "tip" numeric(10,2),
    "total" numeric(10,2) not null,
    "payment_method" character varying(50) not null,
    "payment_status" character varying(50) not null default 'pending'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "status_id" uuid,
    "notes" text,
    "updated_by" uuid
);


alter table "public"."orders" enable row level security;

create table "public"."restaurant_themes" (
    "id" uuid not null default uuid_generate_v4(),
    "restaurant_id" uuid not null,
    "name" character varying(255) not null,
    "template" character varying(50) not null default 'classic'::character varying,
    "layout" character varying(50) not null default 'grid'::character varying,
    "colors" jsonb not null default '{"text": "#1a202c", "muted": "#718096", "accent": "#3182ce", "primary": "#e53e3e", "secondary": "#38a169", "background": "#ffffff"}'::jsonb,
    "font_family" character varying(255) not null default 'Inter, sans-serif'::character varying,
    "logo_url" character varying(255),
    "hero_image_url" character varying(255),
    "custom_css" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "display_options" jsonb default '{"showDescriptions": true}'::jsonb,
    "is_draft" boolean not null default false,
    "parent_theme_id" uuid
);


alter table "public"."restaurant_themes" enable row level security;

create table "public"."restaurants" (
    "id" uuid not null default uuid_generate_v4(),
    "name" character varying(255) not null,
    "logo" character varying(255),
    "description" text,
    "address" text,
    "phone" character varying(20),
    "email" character varying(255),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."user_addresses" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "name" character varying(255) not null,
    "address" text not null,
    "coordinates" jsonb,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "street" character varying(255),
    "building" character varying(255),
    "floor" character varying(255),
    "door" character varying(255),
    "instructions" text
);


alter table "public"."user_addresses" enable row level security;

create table "public"."user_restaurants" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "restaurant_id" uuid not null,
    "role" character varying(50) not null default 'owner'::character varying,
    "permissions" jsonb not null default '{"menu": true, "theme": true, "orders": true}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."users" (
    "id" uuid not null default uuid_generate_v4(),
    "first_name" character varying(255),
    "last_name" character varying(255),
    "phone" character varying(20),
    "role" character varying(50) not null default 'user'::character varying,
    "status" character varying(50) not null default 'active'::character varying,
    "last_login" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "email" text
);


CREATE UNIQUE INDEX campaign_reviews_pkey ON public.campaign_reviews USING btree (id);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE INDEX idx_campaign_reviews_campaign_id ON public.campaign_reviews USING btree (campaign_id);

CREATE INDEX idx_categories_restaurant_id ON public.categories USING btree (restaurant_id);

CREATE INDEX idx_marketing_campaigns_restaurant_id ON public.marketing_campaigns USING btree (restaurant_id);

CREATE INDEX idx_marketing_campaigns_status ON public.marketing_campaigns USING btree (status);

CREATE INDEX idx_menu_items_category_id ON public.menu_items USING btree (category_id);

CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items USING btree (restaurant_id);

CREATE INDEX idx_order_items_menu_item_id ON public.order_items USING btree (menu_item_id);

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history USING btree (order_id);

CREATE INDEX idx_order_status_history_status_id ON public.order_status_history USING btree (status_id);

CREATE INDEX idx_order_tracking_driver_id ON public.order_tracking USING btree (driver_id);

CREATE INDEX idx_order_tracking_order_id ON public.order_tracking USING btree (order_id);

CREATE INDEX idx_orders_restaurant_id ON public.orders USING btree (restaurant_id);

CREATE INDEX idx_orders_status_id ON public.orders USING btree (status_id);

CREATE INDEX idx_orders_updated_by ON public.orders USING btree (updated_by);

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);

CREATE UNIQUE INDEX idx_restaurant_themes_active ON public.restaurant_themes USING btree (restaurant_id) WHERE (is_draft = false);

CREATE INDEX idx_restaurant_themes_is_draft ON public.restaurant_themes USING btree (is_draft);

CREATE INDEX idx_restaurant_themes_parent_theme_id ON public.restaurant_themes USING btree (parent_theme_id);

CREATE INDEX idx_restaurant_themes_restaurant_id ON public.restaurant_themes USING btree (restaurant_id);

CREATE INDEX idx_user_addresses_user_id ON public.user_addresses USING btree (user_id);

CREATE UNIQUE INDEX marketing_campaigns_pkey ON public.marketing_campaigns USING btree (id);

CREATE UNIQUE INDEX menu_items_pkey ON public.menu_items USING btree (id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX order_status_history_pkey ON public.order_status_history USING btree (id);

CREATE UNIQUE INDEX order_statuses_pkey ON public.order_statuses USING btree (id);

CREATE UNIQUE INDEX order_tracking_pkey ON public.order_tracking USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX restaurant_themes_pkey ON public.restaurant_themes USING btree (id);

CREATE UNIQUE INDEX restaurants_pkey ON public.restaurants USING btree (id);

CREATE UNIQUE INDEX user_addresses_pkey ON public.user_addresses USING btree (id);

CREATE UNIQUE INDEX user_restaurants_pkey ON public.user_restaurants USING btree (id);

CREATE UNIQUE INDEX user_restaurants_user_id_restaurant_id_key ON public.user_restaurants USING btree (user_id, restaurant_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."campaign_reviews" add constraint "campaign_reviews_pkey" PRIMARY KEY using index "campaign_reviews_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."marketing_campaigns" add constraint "marketing_campaigns_pkey" PRIMARY KEY using index "marketing_campaigns_pkey";

alter table "public"."menu_items" add constraint "menu_items_pkey" PRIMARY KEY using index "menu_items_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."order_status_history" add constraint "order_status_history_pkey" PRIMARY KEY using index "order_status_history_pkey";

alter table "public"."order_statuses" add constraint "order_statuses_pkey" PRIMARY KEY using index "order_statuses_pkey";

alter table "public"."order_tracking" add constraint "order_tracking_pkey" PRIMARY KEY using index "order_tracking_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."restaurant_themes" add constraint "restaurant_themes_pkey" PRIMARY KEY using index "restaurant_themes_pkey";

alter table "public"."restaurants" add constraint "restaurants_pkey" PRIMARY KEY using index "restaurants_pkey";

alter table "public"."user_addresses" add constraint "user_addresses_pkey" PRIMARY KEY using index "user_addresses_pkey";

alter table "public"."user_restaurants" add constraint "user_restaurants_pkey" PRIMARY KEY using index "user_restaurants_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."campaign_reviews" add constraint "campaign_reviews_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."campaign_reviews" validate constraint "campaign_reviews_campaign_id_fkey";

alter table "public"."campaign_reviews" add constraint "campaign_reviews_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES users(id) not valid;

alter table "public"."campaign_reviews" validate constraint "campaign_reviews_reviewer_id_fkey";

alter table "public"."categories" add constraint "categories_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "categories_restaurant_id_fkey";

alter table "public"."marketing_campaigns" add constraint "marketing_campaigns_created_by_fkey" FOREIGN KEY (created_by) REFERENCES users(id) not valid;

alter table "public"."marketing_campaigns" validate constraint "marketing_campaigns_created_by_fkey";

alter table "public"."marketing_campaigns" add constraint "marketing_campaigns_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_campaigns" validate constraint "marketing_campaigns_restaurant_id_fkey";

alter table "public"."menu_items" add constraint "menu_items_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE not valid;

alter table "public"."menu_items" validate constraint "menu_items_category_id_fkey";

alter table "public"."menu_items" add constraint "menu_items_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE not valid;

alter table "public"."menu_items" validate constraint "menu_items_restaurant_id_fkey";

alter table "public"."order_items" add constraint "order_items_menu_item_id_fkey" FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT not valid;

alter table "public"."order_items" validate constraint "order_items_menu_item_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_status_history" add constraint "order_status_history_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_status_history" validate constraint "order_status_history_order_id_fkey";

alter table "public"."order_status_history" add constraint "order_status_history_status_id_fkey" FOREIGN KEY (status_id) REFERENCES order_statuses(id) not valid;

alter table "public"."order_status_history" validate constraint "order_status_history_status_id_fkey";

alter table "public"."order_status_history" add constraint "order_status_history_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES users(id) not valid;

alter table "public"."order_status_history" validate constraint "order_status_history_updated_by_fkey";

alter table "public"."order_tracking" add constraint "order_tracking_driver_id_fkey" FOREIGN KEY (driver_id) REFERENCES users(id) not valid;

alter table "public"."order_tracking" validate constraint "order_tracking_driver_id_fkey";

alter table "public"."order_tracking" add constraint "order_tracking_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_tracking" validate constraint "order_tracking_order_id_fkey";

alter table "public"."order_tracking" add constraint "order_tracking_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."order_tracking" validate constraint "order_tracking_rating_check";

alter table "public"."orders" add constraint "orders_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_restaurant_id_fkey";

alter table "public"."orders" add constraint "orders_status_id_fkey" FOREIGN KEY (status_id) REFERENCES order_statuses(id) not valid;

alter table "public"."orders" validate constraint "orders_status_id_fkey";

alter table "public"."orders" add constraint "orders_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES users(id) not valid;

alter table "public"."orders" validate constraint "orders_updated_by_fkey";

alter table "public"."restaurant_themes" add constraint "restaurant_themes_parent_theme_id_fkey" FOREIGN KEY (parent_theme_id) REFERENCES restaurant_themes(id) ON DELETE SET NULL not valid;

alter table "public"."restaurant_themes" validate constraint "restaurant_themes_parent_theme_id_fkey";

alter table "public"."restaurant_themes" add constraint "restaurant_themes_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE not valid;

alter table "public"."restaurant_themes" validate constraint "restaurant_themes_restaurant_id_fkey";

alter table "public"."user_restaurants" add constraint "user_restaurants_restaurant_id_fkey" FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE not valid;

alter table "public"."user_restaurants" validate constraint "user_restaurants_restaurant_id_fkey";

alter table "public"."user_restaurants" add constraint "user_restaurants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."user_restaurants" validate constraint "user_restaurants_user_id_fkey";

alter table "public"."user_restaurants" add constraint "user_restaurants_user_id_restaurant_id_key" UNIQUE using index "user_restaurants_user_id_restaurant_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_theme_draft(theme_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_draft_id UUID;
BEGIN
    -- Create a new draft by copying the existing theme
    INSERT INTO restaurant_themes (
        restaurant_id, name, template, layout, colors, 
        font_family, display_options, logo_url, hero_image_url, 
        custom_css, is_draft, parent_theme_id
    )
    SELECT 
        restaurant_id, 
        name || ' (Draft)', 
        template, 
        layout, 
        colors, 
        font_family, 
        display_options, 
        logo_url, 
        hero_image_url, 
        custom_css,
        true,
        id
    FROM restaurant_themes
    WHERE id = theme_id
    RETURNING id INTO new_draft_id;

    RETURN new_draft_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_customer_analytics(restaurant_id uuid, period text, start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, limit_param integer DEFAULT 10)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSONB;
  current_start_date TIMESTAMP WITH TIME ZONE;
  current_end_date TIMESTAMP WITH TIME ZONE;
  previous_start_date TIMESTAMP WITH TIME ZONE;
  previous_end_date TIMESTAMP WITH TIME ZONE;
  current_data JSONB;
  previous_data JSONB;
  customer_growth DECIMAL;
  top_customers JSONB;
  acquisition_trend JSONB;
  retention_rate DECIMAL;
BEGIN
  -- Set date ranges based on period (same logic as previous functions)
  CASE period
    WHEN 'today' THEN
      current_start_date := date_trunc('day', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('day', NOW() - INTERVAL '1 day');
      previous_end_date := date_trunc('day', NOW());
    WHEN 'yesterday' THEN
      current_start_date := date_trunc('day', NOW() - INTERVAL '1 day');
      current_end_date := date_trunc('day', NOW());
      previous_start_date := date_trunc('day', NOW() - INTERVAL '2 days');
      previous_end_date := date_trunc('day', NOW() - INTERVAL '1 day');
    WHEN 'thisWeek' THEN
      current_start_date := date_trunc('week', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('week', NOW()) - INTERVAL '1 week';
      previous_end_date := date_trunc('week', NOW());
    WHEN 'lastWeek' THEN
      current_start_date := date_trunc('week', NOW()) - INTERVAL '1 week';
      current_end_date := date_trunc('week', NOW());
      previous_start_date := date_trunc('week', NOW()) - INTERVAL '2 weeks';
      previous_end_date := date_trunc('week', NOW()) - INTERVAL '1 week';
    WHEN 'thisMonth' THEN
      current_start_date := date_trunc('month', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('month', NOW()) - INTERVAL '1 month';
      previous_end_date := date_trunc('month', NOW());
    WHEN 'lastMonth' THEN
      current_start_date := date_trunc('month', NOW()) - INTERVAL '1 month';
      current_end_date := date_trunc('month', NOW());
      previous_start_date := date_trunc('month', NOW()) - INTERVAL '2 months';
      previous_end_date := date_trunc('month', NOW()) - INTERVAL '1 month';
    WHEN 'last3Months' THEN
      current_start_date := date_trunc('day', NOW()) - INTERVAL '3 months';
      current_end_date := NOW();
      previous_start_date := date_trunc('day', NOW()) - INTERVAL '6 months';
      previous_end_date := date_trunc('day', NOW()) - INTERVAL '3 months';
    WHEN 'thisYear' THEN
      current_start_date := date_trunc('year', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('year', NOW()) - INTERVAL '1 year';
      previous_end_date := date_trunc('year', NOW());
    WHEN 'lastYear' THEN
      current_start_date := date_trunc('year', NOW()) - INTERVAL '1 year';
      current_end_date := date_trunc('year', NOW());
      previous_start_date := date_trunc('year', NOW()) - INTERVAL '2 years';
      previous_end_date := date_trunc('year', NOW()) - INTERVAL '1 year';
    WHEN 'custom' THEN
      IF start_date IS NULL OR end_date IS NULL THEN
        RAISE EXCEPTION 'Custom period requires start_date and end_date parameters';
      END IF;
      current_start_date := start_date;
      current_end_date := end_date;
      -- Calculate previous period of same duration
      previous_start_date := start_date - (end_date - start_date);
      previous_end_date := start_date;
    ELSE
      RAISE EXCEPTION 'Invalid period specified';
  END CASE;

  -- Get new customers in current period
  WITH new_customers AS (
    SELECT 
      user_id,
      MIN(created_at) AS first_order
    FROM 
      orders
    WHERE 
      orders.restaurant_id = get_customer_analytics.restaurant_id
      AND user_id IS NOT NULL
    GROUP BY 
      user_id
    HAVING 
      MIN(created_at) BETWEEN current_start_date AND current_end_date
  )
  -- Get customer metrics for current period
  SELECT
    jsonb_build_object(
      'total_customers', COUNT(DISTINCT user_id),
      'new_customers', (SELECT COUNT(*) FROM new_customers),
      'average_customer_value', COALESCE(SUM(total) / NULLIF(COUNT(DISTINCT user_id), 0), 0)
    ) INTO current_data
  FROM
    orders
  WHERE
    orders.restaurant_id = get_customer_analytics.restaurant_id
    AND user_id IS NOT NULL
    AND created_at BETWEEN current_start_date AND current_end_date;

  -- Get new customers in previous period
  WITH new_customers_prev AS (
    SELECT 
      user_id,
      MIN(created_at) AS first_order
    FROM 
      orders
    WHERE 
      orders.restaurant_id = get_customer_analytics.restaurant_id
      AND user_id IS NOT NULL
    GROUP BY 
      user_id
    HAVING 
      MIN(created_at) BETWEEN previous_start_date AND previous_end_date
  )
  -- Get customer metrics for previous period for growth calculation
  SELECT
    jsonb_build_object(
      'total_customers', COUNT(DISTINCT user_id),
      'new_customers', (SELECT COUNT(*) FROM new_customers_prev)
    ) INTO previous_data
  FROM
    orders
  WHERE
    orders.restaurant_id = get_customer_analytics.restaurant_id
    AND user_id IS NOT NULL
    AND created_at BETWEEN previous_start_date AND previous_end_date;

  -- Calculate customer growth
  IF (previous_data->>'total_customers')::INT > 0 THEN
    customer_growth := (((current_data->>'total_customers')::INT - (previous_data->>'total_customers')::INT) 
                      / (previous_data->>'total_customers')::INT) * 100;
  ELSE
    customer_growth := 0;
  END IF;

  -- Get top customers by spend
  WITH customer_data AS (
    SELECT
      o.user_id,
      COALESCE(o.customer_name, 'Unknown Customer') AS name,
      SUM(o.total) AS total_spend,
      COUNT(*) AS order_count,
      COALESCE(SUM(o.total) / NULLIF(COUNT(*), 0), 0) AS average_order_value,
      MIN(o.created_at) AS first_order_date,
      MAX(o.created_at) AS last_order_date
    FROM
      orders o
    WHERE
      o.restaurant_id = get_customer_analytics.restaurant_id
      AND o.created_at BETWEEN current_start_date AND current_end_date
      AND o.user_id IS NOT NULL
    GROUP BY
      o.user_id, o.customer_name
    ORDER BY
      total_spend DESC
    LIMIT limit_param
  )
  SELECT
    jsonb_agg(
      jsonb_build_object(
        'customer_id', user_id,
        'name', name,
        'total_spend', total_spend,
        'order_count', order_count,
        'average_order_value', average_order_value,
        'first_order_date', to_char(first_order_date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'last_order_date', to_char(last_order_date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      )
    ) INTO top_customers
  FROM
    customer_data;

  -- Calculate retention rate (simplified version)
  -- Customers who ordered in both current and previous periods divided by customers in previous period
  WITH previous_customers AS (
    SELECT DISTINCT user_id
    FROM orders
    WHERE 
      orders.restaurant_id = get_customer_analytics.restaurant_id
      AND created_at BETWEEN previous_start_date AND previous_end_date
      AND user_id IS NOT NULL
  ),
  retained_customers AS (
    SELECT DISTINCT o.user_id
    FROM orders o
    JOIN previous_customers pc ON o.user_id = pc.user_id
    WHERE 
      o.restaurant_id = get_customer_analytics.restaurant_id
      AND o.created_at BETWEEN current_start_date AND current_end_date
      AND o.user_id IS NOT NULL
  )
  SELECT
    CASE
      WHEN (SELECT COUNT(*) FROM previous_customers) > 0 
      THEN ((SELECT COUNT(*) FROM retained_customers)::DECIMAL / 
            (SELECT COUNT(*) FROM previous_customers)::DECIMAL) * 100
      ELSE 0
    END INTO retention_rate;

  -- Get customer acquisition trend (new customers per day)
  WITH first_orders AS (
    SELECT
      date_trunc('day', MIN(created_at)) AS day,
      user_id
    FROM
      orders
    WHERE
      orders.restaurant_id = get_customer_analytics.restaurant_id
      AND user_id IS NOT NULL
      AND created_at BETWEEN current_start_date AND current_end_date
    GROUP BY
      user_id
  ),
  daily_acquisitions AS (
    SELECT
      fo.day,
      COUNT(*) AS new_customers
    FROM
      first_orders fo
    GROUP BY
      fo.day
  ),
  date_series AS (
    SELECT generate_series(
      date_trunc('day', current_start_date),
      date_trunc('day', current_end_date),
      '1 day'::interval
    ) AS day
  )
  SELECT
    jsonb_agg(
      jsonb_build_object(
        'date', to_char(ds.day, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'new_customers', COALESCE(da.new_customers, 0)
      )
      ORDER BY ds.day
    ) INTO acquisition_trend
  FROM
    date_series ds
    LEFT JOIN daily_acquisitions da ON ds.day = da.day;

  -- Build result
  result := jsonb_build_object(
    'total_customers', (current_data->>'total_customers')::INT,
    'new_customers', (current_data->>'new_customers')::INT,
    'customer_growth', customer_growth,
    'average_customer_value', (current_data->>'average_customer_value')::DECIMAL,
    'top_customers', COALESCE(top_customers, '[]'::jsonb),
    'retention_rate', retention_rate,
    'acquisition_trend', COALESCE(acquisition_trend, '[]'::jsonb)
  );

  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_product_analytics(restaurant_id uuid, period text, start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, limit_param integer DEFAULT 10)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSONB;
  current_start_date TIMESTAMP WITH TIME ZONE;
  current_end_date TIMESTAMP WITH TIME ZONE;
  previous_start_date TIMESTAMP WITH TIME ZONE;
  previous_end_date TIMESTAMP WITH TIME ZONE;
  top_products JSONB;
  top_categories JSONB;
BEGIN
  -- Set date ranges based on period (same logic as get_sales_metrics)
  CASE period
    WHEN 'today' THEN
      current_start_date := date_trunc('day', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('day', NOW() - INTERVAL '1 day');
      previous_end_date := date_trunc('day', NOW());
    WHEN 'yesterday' THEN
      current_start_date := date_trunc('day', NOW() - INTERVAL '1 day');
      current_end_date := date_trunc('day', NOW());
      previous_start_date := date_trunc('day', NOW() - INTERVAL '2 days');
      previous_end_date := date_trunc('day', NOW() - INTERVAL '1 day');
    WHEN 'thisWeek' THEN
      current_start_date := date_trunc('week', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('week', NOW()) - INTERVAL '1 week';
      previous_end_date := date_trunc('week', NOW());
    WHEN 'lastWeek' THEN
      current_start_date := date_trunc('week', NOW()) - INTERVAL '1 week';
      current_end_date := date_trunc('week', NOW());
      previous_start_date := date_trunc('week', NOW()) - INTERVAL '2 weeks';
      previous_end_date := date_trunc('week', NOW()) - INTERVAL '1 week';
    WHEN 'thisMonth' THEN
      current_start_date := date_trunc('month', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('month', NOW()) - INTERVAL '1 month';
      previous_end_date := date_trunc('month', NOW());
    WHEN 'lastMonth' THEN
      current_start_date := date_trunc('month', NOW()) - INTERVAL '1 month';
      current_end_date := date_trunc('month', NOW());
      previous_start_date := date_trunc('month', NOW()) - INTERVAL '2 months';
      previous_end_date := date_trunc('month', NOW()) - INTERVAL '1 month';
    WHEN 'last3Months' THEN
      current_start_date := date_trunc('day', NOW()) - INTERVAL '3 months';
      current_end_date := NOW();
      previous_start_date := date_trunc('day', NOW()) - INTERVAL '6 months';
      previous_end_date := date_trunc('day', NOW()) - INTERVAL '3 months';
    WHEN 'thisYear' THEN
      current_start_date := date_trunc('year', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('year', NOW()) - INTERVAL '1 year';
      previous_end_date := date_trunc('year', NOW());
    WHEN 'lastYear' THEN
      current_start_date := date_trunc('year', NOW()) - INTERVAL '1 year';
      current_end_date := date_trunc('year', NOW());
      previous_start_date := date_trunc('year', NOW()) - INTERVAL '2 years';
      previous_end_date := date_trunc('year', NOW()) - INTERVAL '1 year';
    WHEN 'custom' THEN
      IF start_date IS NULL OR end_date IS NULL THEN
        RAISE EXCEPTION 'Custom period requires start_date and end_date parameters';
      END IF;
      current_start_date := start_date;
      current_end_date := end_date;
      -- Calculate previous period of same duration
      previous_start_date := start_date - (end_date - start_date);
      previous_end_date := start_date;
    ELSE
      RAISE EXCEPTION 'Invalid period specified';
  END CASE;

  -- Get top products by revenue using LATERAL joins for JSONB handling
  WITH expanded_items AS (
    SELECT
      o.id AS order_id,
      item->>'menuItem' AS menu_item_json,
      (item->>'totalPrice')::DECIMAL AS total_price
    FROM
      orders o,
      LATERAL jsonb_array_elements(o.items) AS item
    WHERE
      o.restaurant_id = get_product_analytics.restaurant_id
      AND o.created_at BETWEEN current_start_date AND current_end_date
  ),
  current_product_data AS (
    SELECT
      (menu_item_json::jsonb->>'id') AS product_id,
      (menu_item_json::jsonb->>'name') AS product_name,
      SUM(total_price) AS revenue,
      COUNT(DISTINCT order_id) AS order_count
    FROM
      expanded_items
    GROUP BY
      product_id, product_name
  ),
  expanded_prev_items AS (
    SELECT
      o.id AS order_id,
      item->>'menuItem' AS menu_item_json,
      (item->>'totalPrice')::DECIMAL AS total_price
    FROM
      orders o,
      LATERAL jsonb_array_elements(o.items) AS item
    WHERE
      o.restaurant_id = get_product_analytics.restaurant_id
      AND o.created_at BETWEEN previous_start_date AND previous_end_date
  ),
  previous_product_data AS (
    SELECT
      (menu_item_json::jsonb->>'id') AS product_id,
      SUM(total_price) AS revenue,
      COUNT(DISTINCT order_id) AS order_count
    FROM
      expanded_prev_items
    GROUP BY
      product_id
  ),
  product_data AS (
    SELECT
      cpd.product_id,
      cpd.product_name,
      cpd.revenue,
      cpd.order_count,
      mi.category_id,
      c.name AS category_name,
      CASE
        WHEN ppd.revenue IS NULL OR ppd.revenue = 0 THEN 0
        ELSE ((cpd.revenue - ppd.revenue) / ppd.revenue) * 100
      END AS revenue_growth,
      CASE
        WHEN ppd.order_count IS NULL OR ppd.order_count = 0 THEN 0
        ELSE ((cpd.order_count - ppd.order_count) / ppd.order_count) * 100
      END AS order_count_growth
    FROM
      current_product_data cpd
      LEFT JOIN previous_product_data ppd ON cpd.product_id = ppd.product_id
      LEFT JOIN menu_items mi ON cpd.product_id::UUID = mi.id
      LEFT JOIN categories c ON mi.category_id = c.id
    ORDER BY
      cpd.revenue DESC
    LIMIT limit_param
  )
  SELECT
    jsonb_agg(
      jsonb_build_object(
        'product_id', product_id,
        'name', product_name,
        'revenue', revenue,
        'order_count', order_count,
        'category_id', category_id,
        'category_name', category_name,
        'revenue_growth', revenue_growth,
        'order_count_growth', order_count_growth
      )
    ) INTO top_products
  FROM
    product_data;

  -- Get top categories by revenue
  WITH expanded_items AS (
    SELECT
      o.id AS order_id,
      item->>'menuItem' AS menu_item_json,
      (item->>'totalPrice')::DECIMAL AS total_price
    FROM
      orders o,
      LATERAL jsonb_array_elements(o.items) AS item
    WHERE
      o.restaurant_id = get_product_analytics.restaurant_id
      AND o.created_at BETWEEN current_start_date AND current_end_date
  ),
  current_category_data AS (
    SELECT
      c.id AS category_id,
      c.name AS category_name,
      SUM(ei.total_price) AS revenue,
      COUNT(DISTINCT ei.order_id) AS order_count,
      COUNT(DISTINCT mi.id) AS product_count
    FROM
      expanded_items ei
      JOIN menu_items mi ON (ei.menu_item_json::jsonb->>'id')::UUID = mi.id
      JOIN categories c ON mi.category_id = c.id
    GROUP BY
      c.id, c.name
  ),
  expanded_prev_items AS (
    SELECT
      o.id AS order_id,
      item->>'menuItem' AS menu_item_json,
      (item->>'totalPrice')::DECIMAL AS total_price
    FROM
      orders o,
      LATERAL jsonb_array_elements(o.items) AS item
    WHERE
      o.restaurant_id = get_product_analytics.restaurant_id
      AND o.created_at BETWEEN previous_start_date AND previous_end_date
  ),
  previous_category_data AS (
    SELECT
      c.id AS category_id,
      SUM(ei.total_price) AS revenue
    FROM
      expanded_prev_items ei
      JOIN menu_items mi ON (ei.menu_item_json::jsonb->>'id')::UUID = mi.id
      JOIN categories c ON mi.category_id = c.id
    GROUP BY
      c.id
  ),
  category_data AS (
    SELECT
      ccd.category_id,
      ccd.category_name,
      ccd.revenue,
      ccd.order_count,
      ccd.product_count,
      CASE
        WHEN pcd.revenue IS NULL OR pcd.revenue = 0 THEN 0
        ELSE ((ccd.revenue - pcd.revenue) / pcd.revenue) * 100
      END AS revenue_growth
    FROM
      current_category_data ccd
      LEFT JOIN previous_category_data pcd ON ccd.category_id = pcd.category_id
    ORDER BY
      ccd.revenue DESC
    LIMIT limit_param
  )
  SELECT
    jsonb_agg(
      jsonb_build_object(
        'category_id', category_id,
        'name', category_name,
        'revenue', revenue,
        'order_count', order_count,
        'product_count', product_count,
        'revenue_growth', revenue_growth
      )
    ) INTO top_categories
  FROM
    category_data;

  -- Build result
  result := jsonb_build_object(
    'top_products', COALESCE(top_products, '[]'::jsonb),
    'top_categories', COALESCE(top_categories, '[]'::jsonb)
  );

  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_sales_metrics(restaurant_id uuid, period text, start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSONB;
  current_start_date TIMESTAMP WITH TIME ZONE;
  current_end_date TIMESTAMP WITH TIME ZONE;
  previous_start_date TIMESTAMP WITH TIME ZONE;
  previous_end_date TIMESTAMP WITH TIME ZONE;
  current_data JSONB;
  previous_data JSONB;
  revenue_growth DECIMAL;
  order_count_growth DECIMAL;
  revenue_trend JSONB;
  order_count_trend JSONB;
BEGIN
  -- Set date ranges based on period
  CASE period
    WHEN 'today' THEN
      current_start_date := date_trunc('day', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('day', NOW() - INTERVAL '1 day');
      previous_end_date := date_trunc('day', NOW());
    WHEN 'yesterday' THEN
      current_start_date := date_trunc('day', NOW() - INTERVAL '1 day');
      current_end_date := date_trunc('day', NOW());
      previous_start_date := date_trunc('day', NOW() - INTERVAL '2 days');
      previous_end_date := date_trunc('day', NOW() - INTERVAL '1 day');
    WHEN 'thisWeek' THEN
      current_start_date := date_trunc('week', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('week', NOW()) - INTERVAL '1 week';
      previous_end_date := date_trunc('week', NOW());
    WHEN 'lastWeek' THEN
      current_start_date := date_trunc('week', NOW()) - INTERVAL '1 week';
      current_end_date := date_trunc('week', NOW());
      previous_start_date := date_trunc('week', NOW()) - INTERVAL '2 weeks';
      previous_end_date := date_trunc('week', NOW()) - INTERVAL '1 week';
    WHEN 'thisMonth' THEN
      current_start_date := date_trunc('month', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('month', NOW()) - INTERVAL '1 month';
      previous_end_date := date_trunc('month', NOW());
    WHEN 'lastMonth' THEN
      current_start_date := date_trunc('month', NOW()) - INTERVAL '1 month';
      current_end_date := date_trunc('month', NOW());
      previous_start_date := date_trunc('month', NOW()) - INTERVAL '2 months';
      previous_end_date := date_trunc('month', NOW()) - INTERVAL '1 month';
    WHEN 'last3Months' THEN
      current_start_date := date_trunc('day', NOW()) - INTERVAL '3 months';
      current_end_date := NOW();
      previous_start_date := date_trunc('day', NOW()) - INTERVAL '6 months';
      previous_end_date := date_trunc('day', NOW()) - INTERVAL '3 months';
    WHEN 'thisYear' THEN
      current_start_date := date_trunc('year', NOW());
      current_end_date := NOW();
      previous_start_date := date_trunc('year', NOW()) - INTERVAL '1 year';
      previous_end_date := date_trunc('year', NOW());
    WHEN 'lastYear' THEN
      current_start_date := date_trunc('year', NOW()) - INTERVAL '1 year';
      current_end_date := date_trunc('year', NOW());
      previous_start_date := date_trunc('year', NOW()) - INTERVAL '2 years';
      previous_end_date := date_trunc('year', NOW()) - INTERVAL '1 year';
    WHEN 'custom' THEN
      IF start_date IS NULL OR end_date IS NULL THEN
        RAISE EXCEPTION 'Custom period requires start_date and end_date parameters';
      END IF;
      current_start_date := start_date;
      current_end_date := end_date;
      -- Calculate previous period of same duration
      previous_start_date := start_date - (end_date - start_date);
      previous_end_date := start_date;
    ELSE
      RAISE EXCEPTION 'Invalid period specified';
  END CASE;

  -- Get current period data
  SELECT
    jsonb_build_object(
      'total_revenue', COALESCE(SUM(total), 0),
      'order_count', COUNT(*)
    ) INTO current_data
  FROM
    orders o
  WHERE
    o.restaurant_id = get_sales_metrics.restaurant_id
    AND o.created_at BETWEEN current_start_date AND current_end_date;

  -- Get previous period data for growth calculation
  SELECT
    jsonb_build_object(
      'total_revenue', COALESCE(SUM(total), 0),
      'order_count', COUNT(*)
    ) INTO previous_data
  FROM
    orders o
  WHERE
    o.restaurant_id = get_sales_metrics.restaurant_id
    AND o.created_at BETWEEN previous_start_date AND previous_end_date;

  -- Calculate growth percentages
  IF (previous_data->>'total_revenue')::DECIMAL > 0 THEN
    revenue_growth := ((current_data->>'total_revenue')::DECIMAL - (previous_data->>'total_revenue')::DECIMAL) 
                      / (previous_data->>'total_revenue')::DECIMAL * 100;
  ELSE
    revenue_growth := 0;
  END IF;

  IF (previous_data->>'order_count')::INT > 0 THEN
    order_count_growth := ((current_data->>'order_count')::INT - (previous_data->>'order_count')::INT) 
                         / (previous_data->>'order_count')::INT * 100;
  ELSE
    order_count_growth := 0;
  END IF;

  -- Get daily revenue trend for the period
  WITH daily_revenue AS (
    SELECT
      date_trunc('day', o.created_at) AS day,
      COALESCE(SUM(o.total), 0) AS revenue
    FROM
      orders o
    WHERE
      o.restaurant_id = get_sales_metrics.restaurant_id
      AND o.created_at BETWEEN current_start_date AND current_end_date
    GROUP BY
      date_trunc('day', o.created_at)
  ),
  date_series AS (
    SELECT generate_series(
      date_trunc('day', current_start_date),
      date_trunc('day', current_end_date),
      '1 day'::interval
    ) AS day
  )
  SELECT
    jsonb_agg(
      jsonb_build_object(
        'date', to_char(ds.day, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'revenue', COALESCE(dr.revenue, 0)
      )
      ORDER BY ds.day
    ) INTO revenue_trend
  FROM
    date_series ds
    LEFT JOIN daily_revenue dr ON ds.day = dr.day;

  -- Get daily order count trend for the period
  WITH daily_counts AS (
    SELECT
      date_trunc('day', o.created_at) AS day,
      COUNT(*) AS count
    FROM
      orders o
    WHERE
      o.restaurant_id = get_sales_metrics.restaurant_id
      AND o.created_at BETWEEN current_start_date AND current_end_date
    GROUP BY
      date_trunc('day', o.created_at)
  ),
  date_series AS (
    SELECT generate_series(
      date_trunc('day', current_start_date),
      date_trunc('day', current_end_date),
      '1 day'::interval
    ) AS day
  )
  SELECT
    jsonb_agg(
      jsonb_build_object(
        'date', to_char(ds.day, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'count', COALESCE(dc.count, 0)
      )
      ORDER BY ds.day
    ) INTO order_count_trend
  FROM
    date_series ds
    LEFT JOIN daily_counts dc ON ds.day = dc.day;

  -- Calculate average order value
  result := jsonb_build_object(
    'total_revenue', (current_data->>'total_revenue')::DECIMAL,
    'order_count', (current_data->>'order_count')::INT,
    'average_order_value', 
      CASE 
        WHEN (current_data->>'order_count')::INT > 0 
          THEN (current_data->>'total_revenue')::DECIMAL / (current_data->>'order_count')::INT 
        ELSE 0 
      END,
    'revenue_growth', revenue_growth,
    'order_count_growth', order_count_growth,
    'revenue_trend', COALESCE(revenue_trend, '[]'::jsonb),
    'order_count_trend', COALESCE(order_count_trend, '[]'::jsonb)
  );

  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, first_name, last_name, phone, role, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    'customer',
    NEW.email
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.publish_theme(draft_theme_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    published_theme_id UUID;
    draft_restaurant_id UUID;
BEGIN
    -- Get the restaurant_id from the draft theme
    SELECT restaurant_id INTO draft_restaurant_id
    FROM restaurant_themes
    WHERE id = draft_theme_id AND is_draft = true;

    IF draft_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Draft theme not found';
    END IF;

    -- Begin transaction
    BEGIN
        -- Delete the existing published theme if it exists
        DELETE FROM restaurant_themes
        WHERE restaurant_id = draft_restaurant_id 
        AND is_draft = false;

        -- Update the draft theme to be the published version
        UPDATE restaurant_themes
        SET is_draft = false,
            parent_theme_id = NULL,
            updated_at = NOW()
        WHERE id = draft_theme_id
        RETURNING id INTO published_theme_id;

        RETURN published_theme_id;
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_order_status(p_order_id uuid, p_status_id uuid, p_notes text, p_updated_by uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO order_status_history (
    order_id,
    status_id,
    notes,
    updated_by
  ) VALUES (
    p_order_id,
    p_status_id,
    p_notes,
    p_updated_by
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_order_tracking(p_order_id uuid, p_driver_id uuid, p_estimated_delivery_time timestamp with time zone, p_delivery_notes text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO order_tracking (
    order_id,
    driver_id,
    estimated_delivery_time,
    delivery_notes
  ) VALUES (
    p_order_id,
    p_driver_id,
    p_estimated_delivery_time,
    p_delivery_notes
  )
  ON CONFLICT (order_id) DO UPDATE SET
    driver_id = EXCLUDED.driver_id,
    estimated_delivery_time = EXCLUDED.estimated_delivery_time,
    delivery_notes = EXCLUDED.delivery_notes,
    updated_at = NOW();
END;
$function$
;

grant delete on table "public"."campaign_reviews" to "anon";

grant insert on table "public"."campaign_reviews" to "anon";

grant references on table "public"."campaign_reviews" to "anon";

grant select on table "public"."campaign_reviews" to "anon";

grant trigger on table "public"."campaign_reviews" to "anon";

grant truncate on table "public"."campaign_reviews" to "anon";

grant update on table "public"."campaign_reviews" to "anon";

grant delete on table "public"."campaign_reviews" to "authenticated";

grant insert on table "public"."campaign_reviews" to "authenticated";

grant references on table "public"."campaign_reviews" to "authenticated";

grant select on table "public"."campaign_reviews" to "authenticated";

grant trigger on table "public"."campaign_reviews" to "authenticated";

grant truncate on table "public"."campaign_reviews" to "authenticated";

grant update on table "public"."campaign_reviews" to "authenticated";

grant delete on table "public"."campaign_reviews" to "service_role";

grant insert on table "public"."campaign_reviews" to "service_role";

grant references on table "public"."campaign_reviews" to "service_role";

grant select on table "public"."campaign_reviews" to "service_role";

grant trigger on table "public"."campaign_reviews" to "service_role";

grant truncate on table "public"."campaign_reviews" to "service_role";

grant update on table "public"."campaign_reviews" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."marketing_campaigns" to "anon";

grant insert on table "public"."marketing_campaigns" to "anon";

grant references on table "public"."marketing_campaigns" to "anon";

grant select on table "public"."marketing_campaigns" to "anon";

grant trigger on table "public"."marketing_campaigns" to "anon";

grant truncate on table "public"."marketing_campaigns" to "anon";

grant update on table "public"."marketing_campaigns" to "anon";

grant delete on table "public"."marketing_campaigns" to "authenticated";

grant insert on table "public"."marketing_campaigns" to "authenticated";

grant references on table "public"."marketing_campaigns" to "authenticated";

grant select on table "public"."marketing_campaigns" to "authenticated";

grant trigger on table "public"."marketing_campaigns" to "authenticated";

grant truncate on table "public"."marketing_campaigns" to "authenticated";

grant update on table "public"."marketing_campaigns" to "authenticated";

grant delete on table "public"."marketing_campaigns" to "service_role";

grant insert on table "public"."marketing_campaigns" to "service_role";

grant references on table "public"."marketing_campaigns" to "service_role";

grant select on table "public"."marketing_campaigns" to "service_role";

grant trigger on table "public"."marketing_campaigns" to "service_role";

grant truncate on table "public"."marketing_campaigns" to "service_role";

grant update on table "public"."marketing_campaigns" to "service_role";

grant delete on table "public"."menu_items" to "anon";

grant insert on table "public"."menu_items" to "anon";

grant references on table "public"."menu_items" to "anon";

grant select on table "public"."menu_items" to "anon";

grant trigger on table "public"."menu_items" to "anon";

grant truncate on table "public"."menu_items" to "anon";

grant update on table "public"."menu_items" to "anon";

grant delete on table "public"."menu_items" to "authenticated";

grant insert on table "public"."menu_items" to "authenticated";

grant references on table "public"."menu_items" to "authenticated";

grant select on table "public"."menu_items" to "authenticated";

grant trigger on table "public"."menu_items" to "authenticated";

grant truncate on table "public"."menu_items" to "authenticated";

grant update on table "public"."menu_items" to "authenticated";

grant delete on table "public"."menu_items" to "service_role";

grant insert on table "public"."menu_items" to "service_role";

grant references on table "public"."menu_items" to "service_role";

grant select on table "public"."menu_items" to "service_role";

grant trigger on table "public"."menu_items" to "service_role";

grant truncate on table "public"."menu_items" to "service_role";

grant update on table "public"."menu_items" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."order_status_history" to "anon";

grant insert on table "public"."order_status_history" to "anon";

grant references on table "public"."order_status_history" to "anon";

grant select on table "public"."order_status_history" to "anon";

grant trigger on table "public"."order_status_history" to "anon";

grant truncate on table "public"."order_status_history" to "anon";

grant update on table "public"."order_status_history" to "anon";

grant delete on table "public"."order_status_history" to "authenticated";

grant insert on table "public"."order_status_history" to "authenticated";

grant references on table "public"."order_status_history" to "authenticated";

grant select on table "public"."order_status_history" to "authenticated";

grant trigger on table "public"."order_status_history" to "authenticated";

grant truncate on table "public"."order_status_history" to "authenticated";

grant update on table "public"."order_status_history" to "authenticated";

grant delete on table "public"."order_status_history" to "service_role";

grant insert on table "public"."order_status_history" to "service_role";

grant references on table "public"."order_status_history" to "service_role";

grant select on table "public"."order_status_history" to "service_role";

grant trigger on table "public"."order_status_history" to "service_role";

grant truncate on table "public"."order_status_history" to "service_role";

grant update on table "public"."order_status_history" to "service_role";

grant delete on table "public"."order_statuses" to "anon";

grant insert on table "public"."order_statuses" to "anon";

grant references on table "public"."order_statuses" to "anon";

grant select on table "public"."order_statuses" to "anon";

grant trigger on table "public"."order_statuses" to "anon";

grant truncate on table "public"."order_statuses" to "anon";

grant update on table "public"."order_statuses" to "anon";

grant delete on table "public"."order_statuses" to "authenticated";

grant insert on table "public"."order_statuses" to "authenticated";

grant references on table "public"."order_statuses" to "authenticated";

grant select on table "public"."order_statuses" to "authenticated";

grant trigger on table "public"."order_statuses" to "authenticated";

grant truncate on table "public"."order_statuses" to "authenticated";

grant update on table "public"."order_statuses" to "authenticated";

grant delete on table "public"."order_statuses" to "service_role";

grant insert on table "public"."order_statuses" to "service_role";

grant references on table "public"."order_statuses" to "service_role";

grant select on table "public"."order_statuses" to "service_role";

grant trigger on table "public"."order_statuses" to "service_role";

grant truncate on table "public"."order_statuses" to "service_role";

grant update on table "public"."order_statuses" to "service_role";

grant delete on table "public"."order_tracking" to "anon";

grant insert on table "public"."order_tracking" to "anon";

grant references on table "public"."order_tracking" to "anon";

grant select on table "public"."order_tracking" to "anon";

grant trigger on table "public"."order_tracking" to "anon";

grant truncate on table "public"."order_tracking" to "anon";

grant update on table "public"."order_tracking" to "anon";

grant delete on table "public"."order_tracking" to "authenticated";

grant insert on table "public"."order_tracking" to "authenticated";

grant references on table "public"."order_tracking" to "authenticated";

grant select on table "public"."order_tracking" to "authenticated";

grant trigger on table "public"."order_tracking" to "authenticated";

grant truncate on table "public"."order_tracking" to "authenticated";

grant update on table "public"."order_tracking" to "authenticated";

grant delete on table "public"."order_tracking" to "service_role";

grant insert on table "public"."order_tracking" to "service_role";

grant references on table "public"."order_tracking" to "service_role";

grant select on table "public"."order_tracking" to "service_role";

grant trigger on table "public"."order_tracking" to "service_role";

grant truncate on table "public"."order_tracking" to "service_role";

grant update on table "public"."order_tracking" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."restaurant_themes" to "anon";

grant insert on table "public"."restaurant_themes" to "anon";

grant references on table "public"."restaurant_themes" to "anon";

grant select on table "public"."restaurant_themes" to "anon";

grant trigger on table "public"."restaurant_themes" to "anon";

grant truncate on table "public"."restaurant_themes" to "anon";

grant update on table "public"."restaurant_themes" to "anon";

grant delete on table "public"."restaurant_themes" to "authenticated";

grant insert on table "public"."restaurant_themes" to "authenticated";

grant references on table "public"."restaurant_themes" to "authenticated";

grant select on table "public"."restaurant_themes" to "authenticated";

grant trigger on table "public"."restaurant_themes" to "authenticated";

grant truncate on table "public"."restaurant_themes" to "authenticated";

grant update on table "public"."restaurant_themes" to "authenticated";

grant delete on table "public"."restaurant_themes" to "service_role";

grant insert on table "public"."restaurant_themes" to "service_role";

grant references on table "public"."restaurant_themes" to "service_role";

grant select on table "public"."restaurant_themes" to "service_role";

grant trigger on table "public"."restaurant_themes" to "service_role";

grant truncate on table "public"."restaurant_themes" to "service_role";

grant update on table "public"."restaurant_themes" to "service_role";

grant delete on table "public"."restaurants" to "anon";

grant insert on table "public"."restaurants" to "anon";

grant references on table "public"."restaurants" to "anon";

grant select on table "public"."restaurants" to "anon";

grant trigger on table "public"."restaurants" to "anon";

grant truncate on table "public"."restaurants" to "anon";

grant update on table "public"."restaurants" to "anon";

grant delete on table "public"."restaurants" to "authenticated";

grant insert on table "public"."restaurants" to "authenticated";

grant references on table "public"."restaurants" to "authenticated";

grant select on table "public"."restaurants" to "authenticated";

grant trigger on table "public"."restaurants" to "authenticated";

grant truncate on table "public"."restaurants" to "authenticated";

grant update on table "public"."restaurants" to "authenticated";

grant delete on table "public"."restaurants" to "service_role";

grant insert on table "public"."restaurants" to "service_role";

grant references on table "public"."restaurants" to "service_role";

grant select on table "public"."restaurants" to "service_role";

grant trigger on table "public"."restaurants" to "service_role";

grant truncate on table "public"."restaurants" to "service_role";

grant update on table "public"."restaurants" to "service_role";

grant delete on table "public"."user_addresses" to "anon";

grant insert on table "public"."user_addresses" to "anon";

grant references on table "public"."user_addresses" to "anon";

grant select on table "public"."user_addresses" to "anon";

grant trigger on table "public"."user_addresses" to "anon";

grant truncate on table "public"."user_addresses" to "anon";

grant update on table "public"."user_addresses" to "anon";

grant delete on table "public"."user_addresses" to "authenticated";

grant insert on table "public"."user_addresses" to "authenticated";

grant references on table "public"."user_addresses" to "authenticated";

grant select on table "public"."user_addresses" to "authenticated";

grant trigger on table "public"."user_addresses" to "authenticated";

grant truncate on table "public"."user_addresses" to "authenticated";

grant update on table "public"."user_addresses" to "authenticated";

grant delete on table "public"."user_addresses" to "service_role";

grant insert on table "public"."user_addresses" to "service_role";

grant references on table "public"."user_addresses" to "service_role";

grant select on table "public"."user_addresses" to "service_role";

grant trigger on table "public"."user_addresses" to "service_role";

grant truncate on table "public"."user_addresses" to "service_role";

grant update on table "public"."user_addresses" to "service_role";

grant delete on table "public"."user_restaurants" to "anon";

grant insert on table "public"."user_restaurants" to "anon";

grant references on table "public"."user_restaurants" to "anon";

grant select on table "public"."user_restaurants" to "anon";

grant trigger on table "public"."user_restaurants" to "anon";

grant truncate on table "public"."user_restaurants" to "anon";

grant update on table "public"."user_restaurants" to "anon";

grant delete on table "public"."user_restaurants" to "authenticated";

grant insert on table "public"."user_restaurants" to "authenticated";

grant references on table "public"."user_restaurants" to "authenticated";

grant select on table "public"."user_restaurants" to "authenticated";

grant trigger on table "public"."user_restaurants" to "authenticated";

grant truncate on table "public"."user_restaurants" to "authenticated";

grant update on table "public"."user_restaurants" to "authenticated";

grant delete on table "public"."user_restaurants" to "service_role";

grant insert on table "public"."user_restaurants" to "service_role";

grant references on table "public"."user_restaurants" to "service_role";

grant select on table "public"."user_restaurants" to "service_role";

grant trigger on table "public"."user_restaurants" to "service_role";

grant truncate on table "public"."user_restaurants" to "service_role";

grant update on table "public"."user_restaurants" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Admins can see all campaigns"
on "public"."marketing_campaigns"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text)))));


create policy "Admins can update all campaigns"
on "public"."marketing_campaigns"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND ((users.role)::text = 'admin'::text)))));


create policy "Restaurant owners can create campaigns"
on "public"."marketing_campaigns"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.restaurant_id = marketing_campaigns.restaurant_id) AND (ur.user_id = auth.uid())))));


create policy "Restaurant owners can update their own campaigns"
on "public"."marketing_campaigns"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.restaurant_id = marketing_campaigns.restaurant_id) AND (ur.user_id = auth.uid())))));


create policy "Restaurant owners can view their own campaigns"
on "public"."marketing_campaigns"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.restaurant_id = marketing_campaigns.restaurant_id) AND (ur.user_id = auth.uid())))));


create policy "Restaurant owners can view their order items"
on "public"."order_items"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (orders o
     JOIN user_restaurants ur ON ((o.restaurant_id = ur.restaurant_id)))
  WHERE ((order_items.order_id = o.id) AND (ur.user_id = auth.uid())))));


create policy "Restaurant owners can view their order status history"
on "public"."order_status_history"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (orders o
     JOIN user_restaurants ur ON ((o.restaurant_id = ur.restaurant_id)))
  WHERE ((order_status_history.order_id = o.id) AND (ur.user_id = auth.uid())))));


create policy "Allow authenticated users to create order statuses"
on "public"."order_statuses"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow authenticated users to update order statuses"
on "public"."order_statuses"
as permissive
for update
to authenticated
using (true);


create policy "Allow public to view order statuses"
on "public"."order_statuses"
as permissive
for select
to anon
using (true);


create policy "Allow users to view order statuses"
on "public"."order_statuses"
as permissive
for select
to authenticated
using (true);


create policy "Restaurant owners can view order statuses"
on "public"."order_statuses"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE (ur.user_id = auth.uid()))));


create policy "Restaurant owners can view their order tracking"
on "public"."order_tracking"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (orders o
     JOIN user_restaurants ur ON ((o.restaurant_id = ur.restaurant_id)))
  WHERE ((order_tracking.order_id = o.id) AND (ur.user_id = auth.uid())))));


create policy "Anonymous users can create orders"
on "public"."orders"
as permissive
for insert
to anon
with check (true);


create policy "Restaurant owners can update orders for their restaurants"
on "public"."orders"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.restaurant_id = orders.restaurant_id) AND (((ur.permissions ->> 'orders'::text))::boolean = true)))));


create policy "Restaurant owners can update their orders"
on "public"."orders"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.restaurant_id = orders.restaurant_id)))))
with check ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.restaurant_id = orders.restaurant_id)))));


create policy "Restaurant owners can view orders for their restaurants"
on "public"."orders"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.restaurant_id = orders.restaurant_id) AND (((ur.permissions ->> 'orders'::text))::boolean = true)))));


create policy "Restaurant owners can view their orders"
on "public"."orders"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.restaurant_id = orders.restaurant_id)))));


create policy "Users can insert their own orders"
on "public"."orders"
as permissive
for insert
to public
with check (((auth.uid() = user_id) OR (user_id IS NULL)));


create policy "Users can view their own orders"
on "public"."orders"
as permissive
for select
to public
using (((auth.uid() = user_id) OR (user_id IS NULL)));


create policy "Enable delete access for users with theme permissions"
on "public"."restaurant_themes"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.restaurant_id = restaurant_themes.restaurant_id) AND (ur.user_id = auth.uid()) AND (((ur.permissions ->> 'theme'::text))::boolean = true)))));


create policy "Enable insert access for users with theme permissions"
on "public"."restaurant_themes"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.restaurant_id = restaurant_themes.restaurant_id) AND (ur.user_id = auth.uid()) AND (((ur.permissions ->> 'theme'::text))::boolean = true)))));


create policy "Enable public read access for themes"
on "public"."restaurant_themes"
as permissive
for select
to public
using (true);


create policy "Enable update access for users with theme permissions"
on "public"."restaurant_themes"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.restaurant_id = restaurant_themes.restaurant_id) AND (ur.user_id = auth.uid()) AND (((ur.permissions ->> 'theme'::text))::boolean = true)))));


create policy "Users can delete their own addresses"
on "public"."user_addresses"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own addresses"
on "public"."user_addresses"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own addresses"
on "public"."user_addresses"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own addresses"
on "public"."user_addresses"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can see all user_restaurant associations for their restau"
on "public"."user_restaurants"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_restaurants ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.restaurant_id = user_restaurants.restaurant_id) AND ((ur.role)::text = 'owner'::text)))));


create policy "Users can view their own restaurant associations"
on "public"."user_restaurants"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can update their own profile"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view their own profile"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));



