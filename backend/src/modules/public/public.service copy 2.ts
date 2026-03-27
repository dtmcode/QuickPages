import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import {
  tenants,
  pages,
  posts,
  categories,
  products,
  orders,
  orderItems,
  navigations,
  navigationItems,
  seoMeta,
  newsletterSubscribers,
  emailLogs,
  tenantCustomers,
} from '../../drizzle/schema';
import {
  wbPages,
  wbSections,
  wbTemplates,
} from '../../drizzle/website-builder.schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

// ==================== TYPES ====================

interface CustomerRecord {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string | null;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  isMember: boolean;
}

interface JwtCustomerPayload {
  customerId: string;
  tenantId: string;
  type: string;
}

// ==================== SERVICE ====================

@Injectable()
export class PublicService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private jwtService: JwtService,
  ) {}

  // ==================== TENANT ====================

  async getTenantSettings(tenantSlug: string) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) throw new NotFoundException('Tenant not found');

    return {
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      shopTemplate: tenant.shopTemplate,
      settings: tenant.settings,
    };
  }

  async getTenantBranding(tenantSlug: string): Promise<Record<string, unknown>> {
    const [tenant] = await this.db
      .select({ package: tenants.package, branding: tenants.branding })
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) throw new NotFoundException('Tenant not found');

    if (tenant.package !== 'enterprise') return {};

    return (tenant.branding as Record<string, unknown>) ?? {};
  }

  private async getTenantId(tenantSlug: string): Promise<string> {
    const [tenant] = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) throw new NotFoundException('Tenant not found');

    return tenant.id;
  }

  // ==================== CMS PAGES ====================

  async getPublishedPages(tenantSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    return this.db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.tenantId, tenantId),
          eq(pages.isPublished, true),
          eq(pages.status, 'published'),
        ),
      )
      .orderBy(desc(pages.publishedAt));
  }

  async getPageBySlug(tenantSlug: string, pageSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    const [page] = await this.db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.tenantId, tenantId),
          eq(pages.slug, pageSlug),
          eq(pages.isPublished, true),
        ),
      )
      .limit(1);

    if (!page) throw new NotFoundException('Page not found');

    const [seo] = await this.db
      .select()
      .from(seoMeta)
      .where(
        and(
          eq(seoMeta.entityType, 'page'),
          eq(seoMeta.entityId, page.id),
        ),
      )
      .limit(1);

    return { ...page, seo: seo ?? null };
  }

  // ==================== WEBSITE BUILDER ====================

  async getPublishedWbPages(tenantSlug: string, templateId: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    return this.db.query.wbPages.findMany({
      where: and(
        eq(wbPages.tenantId, tenantId),
        eq(wbPages.templateId, templateId),
        eq(wbPages.isActive, true),
      ),
      with: {
        sections: {
          where: eq(wbSections.isActive, true),
          orderBy: [asc(wbSections.order)],
        },
      },
      orderBy: [asc(wbPages.order)],
    });
  }

  async getWbPageBySlug(
    tenantSlug: string,
    templateId: string,
    pageSlug: string,
  ) {
    const tenantId = await this.getTenantId(tenantSlug);

    const wbPage = await this.db.query.wbPages.findFirst({
      where: and(
        eq(wbPages.tenantId, tenantId),
        eq(wbPages.templateId, templateId),
        eq(wbPages.slug, pageSlug),
        eq(wbPages.isActive, true),
      ),
      with: {
        sections: {
          where: eq(wbSections.isActive, true),
          orderBy: [asc(wbSections.order)],
        },
      },
    });

    if (!wbPage) throw new NotFoundException('Website Builder Page not found');

    return wbPage;
  }

  async getWbHomepage(tenantSlug: string, templateId: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    const homepage = await this.db.query.wbPages.findFirst({
      where: and(
        eq(wbPages.tenantId, tenantId),
        eq(wbPages.templateId, templateId),
        eq(wbPages.isHomepage, true),
        eq(wbPages.isActive, true),
      ),
      with: {
        sections: {
          where: eq(wbSections.isActive, true),
          orderBy: [asc(wbSections.order)],
        },
      },
    });

    return homepage ?? null;
  }

  async getDefaultTemplateId(tenantSlug: string): Promise<string | null> {
    const tenantId = await this.getTenantId(tenantSlug);

    const [defaultTemplate] = await this.db
      .select({ id: wbTemplates.id })
      .from(wbTemplates)
      .where(
        and(
          eq(wbTemplates.tenantId, tenantId),
          eq(wbTemplates.isDefault, true),
          eq(wbTemplates.isActive, true),
        ),
      )
      .limit(1);

    return defaultTemplate?.id ?? null;
  }

  // ==================== POSTS ====================

  async getPublishedPosts(tenantSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    return this.db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.tenantId, tenantId),
          eq(posts.isPublished, true),
          eq(posts.status, 'published'),
        ),
      )
      .orderBy(desc(posts.publishedAt));
  }

  async getPostBySlug(tenantSlug: string, postSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    const [post] = await this.db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.tenantId, tenantId),
          eq(posts.slug, postSlug),
          eq(posts.isPublished, true),
        ),
      )
      .limit(1);

    if (!post) throw new NotFoundException('Post not found');

    const [seo] = await this.db
      .select()
      .from(seoMeta)
      .where(
        and(
          eq(seoMeta.entityType, 'post'),
          eq(seoMeta.entityId, post.id),
        ),
      )
      .limit(1);

    return { ...post, seo: seo ?? null };
  }

  // ==================== PRODUCTS ====================

  async getProducts(tenantSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    return this.db
      .select()
      .from(products)
      .where(
        and(eq(products.tenantId, tenantId), eq(products.isActive, true)),
      )
      .orderBy(desc(products.createdAt));
  }

  async getProductBySlug(tenantSlug: string, productSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    const [product] = await this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          eq(products.slug, productSlug),
          eq(products.isActive, true),
        ),
      )
      .limit(1);

    if (!product) throw new NotFoundException('Product not found');

    const [seo] = await this.db
      .select()
      .from(seoMeta)
      .where(
        and(
          eq(seoMeta.entityType, 'product'),
          eq(seoMeta.entityId, product.id),
        ),
      )
      .limit(1);

    return { ...product, seo: seo ?? null };
  }

  // ==================== CATEGORIES ====================

  async getCategories(tenantSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    return this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.tenantId, tenantId),
          eq(categories.isActive, true),
        ),
      );
  }

  // ==================== ORDERS ====================

  async createPublicOrder(
    tenantSlug: string,
    data: {
      customerEmail: string;
      customerName: string;
      customerAddress?: string;
      notes?: string;
      items: Array<{
        productId: string;
        productName: string;
        productPrice: number;
        quantity: number;
      }>;
      subtotal: number;
      shipping: number;
      total: number;
    },
  ) {
    const tenantId = await this.getTenantId(tenantSlug);

    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    const [order] = await this.db
      .insert(orders)
      .values({
        tenantId,
        orderNumber,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerAddress: data.customerAddress,
        status: 'pending',
        subtotal: data.subtotal,
        tax: 0,
        shipping: data.shipping,
        total: data.total,
        notes: data.notes,
      })
      .returning();

    await this.db.insert(orderItems).values(
      data.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity,
        total: item.productPrice * item.quantity,
      })),
    );

    for (const item of data.items) {
      const [product] = await this.db
        .select({ id: products.id, stock: products.stock })
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (product) {
        await this.db
          .update(products)
          .set({
            stock: Math.max(0, (product.stock ?? 0) - item.quantity),
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }
    }

    return { orderNumber: order.orderNumber, id: order.id };
  }

  // ==================== NAVIGATION ====================

  async getNavigation(tenantSlug: string, location: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    const result = await this.db.query.navigations.findFirst({
      where: and(
        eq(navigations.tenantId, tenantId),
        eq(navigations.location, location),
        eq(navigations.isActive, true),
      ),
      with: {
        items: {
          orderBy: [asc(navigationItems.order)],
          with: {
            children: {
              orderBy: [asc(navigationItems.order)],
            },
          },
        },
      },
    });

    return result ?? null;
  }

  // ==================== NEWSLETTER ====================

  async subscribeToNewsletter(
    tenantSlug: string,
    data: {
      email: string;
      firstName?: string;
      lastName?: string;
      source?: string;
    },
  ) {
    const tenantId = await this.getTenantId(tenantSlug);

    const [existing] = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.tenantId, tenantId),
          eq(newsletterSubscribers.email, data.email),
        ),
      )
      .limit(1);

    if (existing) {
      if (existing.status === 'unsubscribed') {
        await this.db
          .update(newsletterSubscribers)
          .set({
            status: 'active',
            subscribedAt: new Date(),
            unsubscribedAt: null,
            source: data.source ?? 'website-resubscribe',
            updatedAt: new Date(),
          })
          .where(eq(newsletterSubscribers.id, existing.id));

        return { success: true, message: 'Willkommen zurück!' };
      }

      return { success: true, message: 'Du bist bereits angemeldet!' };
    }

    await this.db.insert(newsletterSubscribers).values({
      tenantId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      status: 'active',
      source: data.source ?? 'website',
      subscribedAt: new Date(),
      unsubscribeToken: randomUUID(),
      confirmToken: randomUUID(),
    });

    return { success: true, message: 'Erfolgreich angemeldet! 🎉' };
  }

  // ==================== CONTACT FORM ====================

  async submitContactForm(
    tenantSlug: string,
    data: {
      name: string;
      email: string;
      message: string;
      phone?: string;
      subject?: string;
    },
  ) {
    const tenantId = await this.getTenantId(tenantSlug);

    await this.db.insert(emailLogs).values({
      tenantId,
      to: 'contact-form',
      from: data.email,
      subject: data.subject ?? `Kontaktanfrage von ${data.name}`,
      template: 'contact-form',
      status: 'received',
      error: JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message,
        phone: data.phone,
        submittedAt: new Date().toISOString(),
      }),
    });

    return { success: true, message: 'Deine Nachricht wurde gesendet!' };
  }

  // ==================== CUSTOMER AUTH ====================

  async customerRegister(
    tenantSlug: string,
    data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    const tenantId = await this.getTenantId(tenantSlug);

    const existing = await this.db
      .select({ id: tenantCustomers.id })
      .from(tenantCustomers)
      .where(
        and(
          eq(tenantCustomers.tenantId, tenantId),
          eq(tenantCustomers.email, data.email),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('E-Mail bereits registriert');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await this.db
      .insert(tenantCustomers)
      .values({
        tenantId,
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        isMember: false,
      })
      .returning();

    const customer = result[0] as CustomerRecord;

    const accessToken = this.jwtService.sign({
      customerId: customer.id,
      tenantId,
      type: 'customer',
    });

    return {
      accessToken,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }

  async customerLogin(
    tenantSlug: string,
    data: { email: string; password: string },
  ) {
    const tenantId = await this.getTenantId(tenantSlug);

    const result = await this.db
      .select()
      .from(tenantCustomers)
      .where(
        and(
          eq(tenantCustomers.tenantId, tenantId),
          eq(tenantCustomers.email, data.email),
          eq(tenantCustomers.isActive, true),
        ),
      )
      .limit(1);

    const customer = result[0] as CustomerRecord | undefined;

    if (!customer?.passwordHash) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    const valid = await bcrypt.compare(data.password, customer.passwordHash);
    if (!valid) throw new UnauthorizedException('Ungültige Anmeldedaten');

    const accessToken = this.jwtService.sign({
      customerId: customer.id,
      tenantId,
      type: 'customer',
    });

    return {
      accessToken,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }

  async getCustomerOrders(tenantSlug: string, token: string) {
    let payload: JwtCustomerPayload;

    try {
      payload = this.jwtService.verify<JwtCustomerPayload>(token);
    } catch {
      throw new UnauthorizedException('Ungültiges Token');
    }

    if (payload.type !== 'customer') {
      throw new UnauthorizedException();
    }

    const tenantId = await this.getTenantId(tenantSlug);

    const customerResult = await this.db
      .select({ email: tenantCustomers.email })
      .from(tenantCustomers)
      .where(eq(tenantCustomers.id, payload.customerId))
      .limit(1);

    const customer = customerResult[0];
    if (!customer) throw new UnauthorizedException();

    return this.db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          eq(orders.customerEmail, customer.email),
        ),
      )
      .orderBy(desc(orders.createdAt));
  }
}
