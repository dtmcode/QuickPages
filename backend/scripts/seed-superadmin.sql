-- ============================================================
-- PFAD: backend/scripts/seed-superadmin.sql
--
-- Erstellt den MyQuickPages Platform-Admin Account
-- Login: admin@myquickpages.de / QuickPages2025!
--
-- Ausführen (eine der folgenden Methoden):
--   psql $DATABASE_URL -f scripts/seed-superadmin.sql
--   oder in DBeaver / TablePlus / pgAdmin direkt ausführen
--
-- Passwort ändern:
--   node -e "require('bcrypt').hash('NeuesPasswort',12).then(console.log)"
--   → neuen Hash in Zeile mit password_hash eintragen
-- ============================================================

-- ==================== CLEANUP ====================
-- (sicher bei erneutem Ausführen)

DELETE FROM users WHERE email = 'admin@myquickpages.de';

DELETE FROM subscriptions
WHERE
    tenant_id = (
        SELECT id
        FROM tenants
        WHERE
            slug = 'myquickpages'
    );

DELETE FROM tenants WHERE slug = 'myquickpages';

-- ==================== 1. PLATFORM TENANT ====================

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
        'MyQuickPages Platform',
        'myquickpages',
        'enterprise',
        jsonb_build_object (
            'isSuperAdmin',
            true,
            'platformAdmin',
            true,
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
                999999,
                'products',
                999999,
                'emails',
                999999,
                'posts',
                999999,
                'pages',
                999999,
                'subscribers',
                999999
            )
        ),
        true,
        NOW(),
        NOW()
    );

-- ==================== 2. SUBSCRIPTION ====================
-- enterprise, 10 Jahre gültig, kein Auto-Cancel

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
                slug = 'myquickpages'
        ),
        'enterprise',
        'active',
        NOW(),
        NOW() + INTERVAL '10 years',
        false,
        NOW(),
        NOW()
    );

-- ==================== 3. SUPER-ADMIN USER ====================
-- Passwort: QuickPages2025!
-- Neuen Hash generieren: node -e "require('bcrypt').hash('DeinPasswort',12).then(console.log)"

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
                slug = 'myquickpages'
        ),
        'admin@myquickpages.de',
        '$2b$12$dDHSWJcYn9WKYQkcm.hJ5ujRmpwl.ax91dORc7WlzQAp9QwaIDFue',
        'owner',
        'Platform',
        'Admin',
        true,
        true,
        NOW(),
        NOW()
    );

-- ==================== VERIFY ====================
-- Diese Abfrage zeigt den erstellten Account

SELECT
  t.name        AS tenant_name,
  t.slug,
  t.package,
  u.email,
  u.role,
  u.email_verified,
  u.is_active,
  s.status      AS subscription,
  s.current_period_end::date AS valid_until,
  (t.settings->>'isSuperAdmin')::boolean AS is_super_admin
FROM tenants t
JOIN users u         ON u.tenant_id = t.id
JOIN subscriptions s ON s.tenant_id = t.id
WHERE t.slug = 'myquickpages';