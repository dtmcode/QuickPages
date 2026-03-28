// 📂 PFAD: backend/scripts/stripe-setup-products.ts
// Run: npx ts-node -r tsconfig-paths/register scripts/stripe-setup-products.ts

import 'dotenv/config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PACKAGES = [
  { key: 'website_micro',         name: 'Website Micro',          price: 900   },
  { key: 'website_standard',      name: 'Website Standard',       price: 1900  },
  { key: 'website_pro',           name: 'Website Pro',            price: 2900  },
  { key: 'blog_personal',         name: 'Blog Personal',          price: 1900  },
  { key: 'blog_publisher',        name: 'Blog Publisher',         price: 3900  },
  { key: 'blog_magazine',         name: 'Blog Magazine',          price: 7900  },
  { key: 'business_starter',      name: 'Business Starter',       price: 2900  },
  { key: 'business_professional', name: 'Business Professional',  price: 5900  },
  { key: 'business_agency',       name: 'Business Agency',        price: 9900  },
  { key: 'shop_mini',             name: 'Shop Mini',              price: 3900  },
  { key: 'shop_wachstum',         name: 'Shop Wachstum',          price: 6900  },
  { key: 'shop_premium',          name: 'Shop Premium',           price: 11900 },
  { key: 'members_community',     name: 'Members Community',      price: 2900  },
  { key: 'members_kurse',         name: 'Members Kurse',          price: 5900  },
  { key: 'members_academy',       name: 'Members Academy',        price: 9900  },
];

const ADDONS = [
  { key: 'addon_shop_module',      name: 'Add-on: Shop-Modul',        price: 1900 },
  { key: 'addon_booking_module',   name: 'Add-on: Booking-Modul',     price: 1200 },
  { key: 'addon_blog_module',      name: 'Add-on: Blog-Modul',        price: 900  },
  { key: 'addon_members_module',   name: 'Add-on: Mitglieder-Modul',  price: 1900 },
  { key: 'addon_newsletter_extra', name: 'Add-on: Newsletter +1.000', price: 900  },
  { key: 'addon_ai_content',       name: 'Add-on: AI Content',        price: 1400 },
  { key: 'addon_extra_pages',      name: 'Add-on: Extra Seiten +10',  price: 500  },
  { key: 'addon_extra_users',      name: 'Add-on: Extra Benutzer',    price: 400  },
  { key: 'addon_i18n',             name: 'Add-on: Mehrsprachigkeit',  price: 900  },
];

async function createOrGetPrice(
  item: { key: string; name: string; price: number },
  type: 'package' | 'addon'
): Promise<{ productId: string; priceId: string }> {
  // Existierendes Product suchen
  const existing = await stripe.products.search({
    query: `metadata['quickpages_key']:'${item.key}'`,
  });

  let product: Stripe.Product;
  if (existing.data.length > 0) {
    product = existing.data[0];
    console.log(`  ↻  ${item.name} (existiert)`);
  } else {
    product = await stripe.products.create({
      name: `QuickPages ${item.name}`,
      metadata: { quickpages_key: item.key, quickpages_type: type },
    });
    console.log(`  +  ${item.name} (neu)`);
  }

  // Existierenden Price suchen
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
  const existing_price = prices.data.find(
    p => p.unit_amount === item.price && p.currency === 'eur' && p.recurring?.interval === 'month'
  );

  let price: Stripe.Price;
  if (existing_price) {
    price = existing_price;
  } else {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: item.price,
      currency: 'eur',
      recurring: { interval: 'month' },
      metadata: { quickpages_key: item.key, quickpages_type: type },
    });
  }

  return { productId: product.id, priceId: price.id };
}

async function main() {
  const mode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? '🔴 LIVE' : '🟡 TEST';
  console.log(`\n🔧 Stripe Products Setup — ${mode}\n`);

  const results: Record<string, { productId: string; priceId: string }> = {};

  console.log('📦 Pakete:');
  for (const pkg of PACKAGES) {
    results[pkg.key] = await createOrGetPrice(pkg, 'package');
  }

  console.log('\n➕ Add-ons:');
  for (const addon of ADDONS) {
    results[addon.key] = await createOrGetPrice(addon, 'addon');
  }

  // Output für .env
  console.log('\n' + '='.repeat(60));
  console.log('✅ In .env eintragen:');
  console.log('='.repeat(60) + '\n');

  console.log('# Stripe Keys');
  console.log('STRIPE_SECRET_KEY=sk_test_...');
  console.log('STRIPE_PUBLISHABLE_KEY=pk_test_...');
  console.log('STRIPE_WEBHOOK_SECRET=whsec_...  # nach Webhook-Einrichtung\n');

  console.log('# Package Prices');
  for (const pkg of PACKAGES) {
    console.log(`STRIPE_PRICE_${pkg.key.toUpperCase()}=${results[pkg.key]?.priceId || 'ERROR'}`);
  }

  console.log('\n# Addon Prices');
  for (const addon of ADDONS) {
    console.log(`STRIPE_PRICE_${addon.key.toUpperCase()}=${results[addon.key]?.priceId || 'ERROR'}`);
  }

  console.log('\n💡 Webhook in Stripe Dashboard einrichten:');
  console.log('   URL: https://deine-domain.de/stripe/webhook');
  console.log('   Events: checkout.session.completed, customer.subscription.updated,');
  console.log('           customer.subscription.deleted, invoice.payment_failed\n');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });