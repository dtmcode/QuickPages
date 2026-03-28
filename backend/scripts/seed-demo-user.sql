-- ============================================================
-- PFAD: backend/scripts/seed-demo-user.sql
--
-- Demo-Account für Tester und Interessenten
--
-- Accounts:
--   demo@quickpages.de    / Demo2025!    (Owner — voller Zugang)
--   tester@quickpages.de  / Tester2025!  (Admin — zum Teilen)
--
-- Ausführen:
--   psql $DATABASE_URL -f scripts/seed-demo-user.sql
--
-- Reset: Einfach nochmal ausführen (CLEANUP löscht vorher alles)
-- ============================================================

-- ==================== CLEANUP ====================

DO $$
DECLARE
  demo_tenant_id UUID;
BEGIN
  SELECT id INTO demo_tenant_id FROM tenants WHERE slug = 'demo-quickpages';

  IF demo_tenant_id IS NOT NULL THEN
    DELETE FROM newsletter_subscribers WHERE tenant_id = demo_tenant_id;
    DELETE FROM users WHERE tenant_id = demo_tenant_id;
    DELETE FROM subscriptions WHERE tenant_id = demo_tenant_id;
    DELETE FROM tenants WHERE id = demo_tenant_id;
    RAISE NOTICE 'Alter Demo-Account gelöscht.';
  END IF;
END $$;

-- ==================== 1. DEMO TENANT ====================

INSERT INTO
    tenants (
        id,
        name,
        slug,
        package,
        settings,
        is_active,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid (),
        'Demo GmbH',
        'demo-quickpages',
        'enterprise',
        jsonb_build_object (
            'isDemo',
            true,
            'demoAccount',
            true,
            'isSuperAdmin',
            false,
            'modules',
            jsonb_build_object (
                'cms',
                true,
                'shop',
                true,
                'email',
                true,
                'landing',
                true,
                'booking',
                true,
                'newsletter',
                true,
                'analytics',
                true,
                'ai',
                true,
                'members',
                true,
                'forms',
                true,
                'i18n',
                true
            ),
            'limits',
            jsonb_build_object (
                'users',
                10,
                'products',
                500,
                'emails',
                5000,
                'posts',
                200,
                'pages',
                50,
                'subscribers',
                5000
            ),
            'branding',
            jsonb_build_object (
                'platformName',
                'Demo GmbH',
                'logoInitial',
                'D',
                'primaryColor',
                '#6366f1'
            )
        ),
        true,
        NOW(),
        NOW()
    );

-- ==================== 2. SUBSCRIPTION ====================

INSERT INTO
    subscriptions (
        id,
        tenant_id,
        package,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid (),
        (
            SELECT id
            FROM tenants
            WHERE
                slug = 'demo-quickpages'
        ),
        'enterprise',
        'active',
        NOW(),
        NOW() + INTERVAL '5 years',
        false,
        NOW(),
        NOW()
    );

-- ==================== 3. USERS ====================

-- Owner: demo@quickpages.de / Demo2025!
INSERT INTO
    users (
        id,
        tenant_id,
        email,
        password_hash,
        role,
        first_name,
        last_name,
        is_active,
        email_verified,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid (),
        (
            SELECT id
            FROM tenants
            WHERE
                slug = 'demo-quickpages'
        ),
        'demo@quickpages.de',
        '$2b$12$KJnHXLnGnwRYQblYJSC2x.JSpq0BcPDWB2P06BAI.R0r0T3qf5cye',
        'owner',
        'Demo',
        'User',
        true,
        true,
        NOW(),
        NOW()
    );

-- Admin: tester@quickpages.de / Tester2025!
-- → zum Teilen mit mehreren Personen gleichzeitig
INSERT INTO
    users (
        id,
        tenant_id,
        email,
        password_hash,
        role,
        first_name,
        last_name,
        is_active,
        email_verified,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid (),
        (
            SELECT id
            FROM tenants
            WHERE
                slug = 'demo-quickpages'
        ),
        'tester@quickpages.de',
        '$2b$12$6XXH6oChkdY7iXodWiiNkuWMsTMxaUy8ujEH0zBWyxIKFQi2dxTeW',
        'admin',
        'Test',
        'User',
        true,
        true,
        NOW(),
        NOW()
    );

-- ==================== 4. NEWSLETTER SUBSCRIBER BEISPIELDATEN ====================
-- Dashboard sieht sofort befüllt aus — keine leere Seite beim ersten Login

INSERT INTO newsletter_subscribers (
  id, tenant_id, email, first_name, last_name,
  status, source, tags, subscribed_at, confirmed_at, created_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM tenants WHERE slug = 'demo-quickpages'),
  lower(first_name) || '.' || lower(last_name) || n || '@beispiel.de',
  first_name, last_name,
  'active',
  CASE WHEN n % 3 = 0 THEN 'landing_page'
       WHEN n % 3 = 1 THEN 'website'
       ELSE 'referral' END,
  CASE WHEN n % 4 = 0 THEN ARRAY['vip', 'newsletter']
       WHEN n % 4 = 1 THEN ARRAY['newsletter', 'kunde']
       WHEN n % 4 = 2 THEN ARRAY['newsletter', 'interessent']
       ELSE ARRAY['newsletter'] END,
  NOW() - (n || ' days')::interval,
  NOW() - (n || ' days')::interval,
  NOW() - (n || ' days')::interval
FROM (
  VALUES
    (1,'Max','Müller'),(2,'Anna','Schmidt'),(3,'Tom','Weber'),
    (4,'Lisa','Fischer'),(5,'Peter','Koch'),(6,'Sarah','Bauer'),
    (7,'Klaus','Richter'),(8,'Marie','Wolf'),(9,'Jan','Schäfer'),
    (10,'Eva','Becker'),(11,'Felix','Hoffmann'),(12,'Julia','Meyer'),
    (13,'Markus','Wagner'),(14,'Nina','Braun'),(15,'Stefan','Schulz'),
    (16,'Lena','Krause'),(17,'Tim','Zimmermann'),(18,'Petra','König'),
    (19,'Andreas','Klein'),(20,'Sandra','Walter'),(21,'Michael','Frank'),
    (22,'Katharina','Lehmann'),(23,'Daniel','Schmitt'),(24,'Laura','Meier'),
    (25,'Christian','Günther'),(26,'Monika','Schwarz'),(27,'Tobias','Sommer'),
    (28,'Claudia','Werner'),(29,'Florian','Böhm'),(30,'Sabrina','Lang'),
    (31,'Patrick','Vogt'),(32,'Melanie','Huber'),(33,'Sebastian','Schneider'),
    (34,'Jessica','Pfeiffer'),(35,'Matthias','Müller'),(36,'Nicole','Hartmann'),
    (37,'Oliver','Berger'),(38,'Christine','Winkler'),(39,'Dominik','Krüger'),
    (40,'Stefanie','Möller'),(41,'Benjamin','Koch'),(42,'Anja','Herrmann'),
    (43,'David','Horn'),(44,'Silke','Kuhn'),(45,'Philipp','Graf'),
    (46,'Rebecca','Köhler'),(47,'Simon','Lange')
) AS t(n, first_name, last_name);

-- Pending Subscriber (noch nicht bestätigt)
INSERT INTO newsletter_subscribers (
  id, tenant_id, email, first_name, status, source, tags, created_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM tenants WHERE slug = 'demo-quickpages'),
  'lead' || n || '@example.com',
  'Interessent ' || n,
  'pending', 'landing_page', ARRAY['lead'],
  NOW() - (n || ' hours')::interval
FROM generate_series(1, 9) AS n;

-- ==================== VERIFY ====================

SELECT '=== Demo Accounts ===' AS info;

SELECT
  t.name          AS tenant,
  t.slug,
  t.package,
  u.email,
  u.role,
  u.first_name    AS vorname,
  (t.settings->>'isDemo')::boolean AS is_demo,
  s.status        AS abo,
  s.current_period_end::date AS gültig_bis
FROM tenants t
JOIN users u ON u.tenant_id = t.id
JOIN subscriptions s ON s.tenant_id = t.id
WHERE t.slug = 'demo-quickpages'
ORDER BY u.role;

SELECT
    COUNT(*) FILTER (
        WHERE
            status = 'active'
    ) AS aktive_subscriber,
    COUNT(*) FILTER (
        WHERE
            status = 'pending'
    ) AS pending_subscriber,
    COUNT(*) AS gesamt
FROM newsletter_subscribers
WHERE
    tenant_id = (
        SELECT id
        FROM tenants
        WHERE
            slug = 'demo-quickpages'
    );