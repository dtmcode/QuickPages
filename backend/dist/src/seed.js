"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
const schema_1 = require("./drizzle/schema");
dotenv.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = (0, node_postgres_1.drizzle)(pool);
async function seed() {
    console.log('🌱 Seeding database...');
    try {
        console.log('Creating demo tenant...');
        const [tenant] = await db
            .insert(schema_1.tenants)
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
        console.log('Creating pages...');
        await db.insert(schema_1.pages).values([
            {
                tenantId: tenant.id,
                title: 'About Us',
                slug: 'about',
                content: '<h1>About Demo Store</h1><p>Welcome to our amazing store!</p>',
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
        console.log('Creating blog posts...');
        await db.insert(schema_1.posts).values([
            {
                tenantId: tenant.id,
                title: 'Welcome to Our Blog',
                slug: 'welcome',
                content: '<h2>Welcome!</h2><p>This is our first blog post. Stay tuned for more!</p>',
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
        console.log('Creating categories...');
        const [category] = await db
            .insert(schema_1.categories)
            .values({
            tenantId: tenant.id,
            name: 'Electronics',
            slug: 'electronics',
            description: 'Electronic devices and gadgets',
            isActive: true,
        })
            .returning();
        console.log('Creating products...');
        await db.insert(schema_1.products).values([
            {
                tenantId: tenant.id,
                categoryId: category.id,
                name: 'Wireless Headphones',
                slug: 'wireless-headphones',
                description: '<p>Premium wireless headphones with noise cancellation.</p>',
                price: 19999,
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
                price: 29999,
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
                price: 7999,
                stock: 100,
                images: JSON.stringify(['https://via.placeholder.com/400']),
                isActive: true,
                isFeatured: true,
            },
        ]);
        console.log('✅ Seeding complete!');
        console.log('🎉 You can now visit: http://localhost:3002');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
    }
    finally {
        await pool.end();
    }
}
seed();
//# sourceMappingURL=seed.js.map