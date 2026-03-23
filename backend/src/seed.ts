import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import {
  tenants,
  pages,
  posts,
  products,
  categories,
  users,
} from './drizzle/schema';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Demo Tenant
    console.log('Creating demo tenant...');
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: 'Demo Store',
        slug: 'demo',
        package: 'starter',
        shopTemplate: 'default',
        settings: {
          modules: {
            cms: true,
            shop: true,
            email: false,
            landing: true,
          },
          limits: {
            users: 5,
            products: 100,
            emails: 1000,
          },
        },
        isActive: true,
      })
      .returning();

    console.log('✅ Tenant created:', tenant);

    // 2. Test Pages
    console.log('Creating pages...');
    await db.insert(pages).values([
      {
        tenantId: tenant.id,
        title: 'About Us',
        slug: 'about',
        content:
          '<h1>About Demo Store</h1><p>Welcome to our amazing store!</p>',
        excerpt: 'Learn more about us',
        template: 'default',
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        title: 'Contact',
        slug: 'contact',
        content: '<h1>Contact Us</h1><p>Get in touch with us today!</p>',
        excerpt: 'Get in touch',
        template: 'contact',
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
      },
    ]);

    // 3. Test Blog Posts
    console.log('Creating blog posts...');
    await db.insert(posts).values([
      {
        tenantId: tenant.id,
        title: 'Welcome to Our Blog',
        slug: 'welcome',
        content:
          '<h2>Welcome!</h2><p>This is our first blog post. Stay tuned for more!</p>',
        excerpt: 'Our first blog post',
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        tenantId: tenant.id,
        title: '5 Tips for Success',
        slug: '5-tips-success',
        content: '<h2>5 Tips</h2><p>Here are our top 5 tips for success...</p>',
        excerpt: 'Learn our top tips',
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
      },
    ]);

    // 4. Test Category
    console.log('Creating categories...');
    const [category] = await db
      .insert(categories)
      .values({
        tenantId: tenant.id,
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
      })
      .returning();

    // 5. Test Products
    console.log('Creating products...');
    await db.insert(products).values([
      {
        tenantId: tenant.id,
        categoryId: category.id,
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description:
          '<p>Premium wireless headphones with noise cancellation.</p>',
        price: 19999, // €199.99
        compareAtPrice: 29999,
        stock: 50,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        isActive: true,
        isFeatured: true,
      },
      {
        tenantId: tenant.id,
        categoryId: category.id,
        name: 'Smart Watch',
        slug: 'smart-watch',
        description: '<p>Track your fitness and stay connected.</p>',
        price: 29999, // €299.99
        stock: 30,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        isActive: true,
        isFeatured: true,
      },
      {
        tenantId: tenant.id,
        categoryId: category.id,
        name: 'Bluetooth Speaker',
        slug: 'bluetooth-speaker',
        description: '<p>Portable speaker with amazing sound quality.</p>',
        price: 7999, // €79.99
        stock: 100,
        images: JSON.stringify(['https://via.placeholder.com/400']),
        isActive: true,
        isFeatured: true,
      },
    ]);

    console.log('✅ Seeding complete!');
    console.log('🎉 You can now visit: http://localhost:3002');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
