// 📂 PFAD: backend/src/modules/public/public.service.ts

import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import {
  tenants,
  pages,
  posts,
  categories,
  products,
  navigations,
  navigationItems,
  seoMeta,
  newsletterSubscribers,
  emailLogs,
} from '../../drizzle/schema';

import {
  wbPages,
  wbSections,
  wbTemplates,
} from '../../drizzle/website-builder.schema';

import { eq, and, desc, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class PublicService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ==================== TENANT ====================
  async getTenantSettings(tenantSlug: string) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      shopTemplate: tenant.shopTemplate,
      settings: tenant.settings,
    };
  }

  private async getTenantId(tenantSlug: string): Promise<string> {
    const [tenant] = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.slug, tenantSlug), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant.id;
  }

  // ==================== PAGES (CMS) ====================
  async getPublishedPages(tenantSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    const result = await this.db
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

    return result;
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

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const [seo] = await this.db
      .select()
      .from(seoMeta)
      .where(and(eq(seoMeta.entityType, 'page'), eq(seoMeta.entityId, page.id)))
      .limit(1);

    return {
      ...page,
      seo: seo || null,
    };
  }

  // ==================== WEBSITE BUILDER PAGES ====================

  async getPublishedWbPages(tenantSlug: string, templateId: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    const wbPagesResult = await this.db.query.wbPages.findMany({
      where: and(
        eq(wbPages.tenantId, tenantId),
        eq(wbPages.templateId, templateId),
        eq(wbPages.isActive, true),
      ),
      with: {
        sections: {
          where: eq(wbSections.isActive, true),
          orderBy: asc(wbSections.order),
        },
      },
      orderBy: asc(wbPages.order),
    });

    return wbPagesResult;
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
          orderBy: asc(wbSections.order),
        },
      },
    });

    if (!wbPage) {
      throw new NotFoundException('Website Builder Page not found');
    }

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
          orderBy: asc(wbSections.order),
        },
      },
    });

    return homepage || null;
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

    return defaultTemplate?.id || null;
  }

  // ==================== POSTS ====================
  async getPublishedPosts(tenantSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    const result = await this.db
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

    return result;
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

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const [seo] = await this.db
      .select()
      .from(seoMeta)
      .where(and(eq(seoMeta.entityType, 'post'), eq(seoMeta.entityId, post.id)))
      .limit(1);

    return {
      ...post,
      seo: seo || null,
    };
  }

  // ==================== PRODUCTS ====================
  async getProducts(tenantSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    const result = await this.db
      .select()
      .from(products)
      .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt));

    return result;
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

    if (!product) {
      throw new NotFoundException('Product not found');
    }

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

    return {
      ...product,
      seo: seo || null,
    };
  }

  // ==================== CATEGORIES ====================
  async getCategories(tenantSlug: string) {
    const tenantId = await this.getTenantId(tenantSlug);

    return this.db
      .select()
      .from(categories)
      .where(
        and(eq(categories.tenantId, tenantId), eq(categories.isActive, true)),
      );
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
          orderBy: asc(navigationItems.order),
          with: {
            children: {
              orderBy: asc(navigationItems.order),
            },
          },
        },
      },
    });

    return result || null;
  }

  // ==================== NEWSLETTER SUBSCRIBE ✅ NEU ====================
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

    // Prüfe ob bereits abonniert
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
        // Re-subscribe
        await this.db
          .update(newsletterSubscribers)
          .set({
            status: 'active',
            subscribedAt: new Date(),
            unsubscribedAt: null,
            source: data.source || 'website-resubscribe',
            updatedAt: new Date(),
          })
          .where(eq(newsletterSubscribers.id, existing.id));

        return {
          success: true,
          message: 'Willkommen zurück! Du bist wieder angemeldet.',
        };
      }

      // Bereits aktiv — kein Fehler werfen, einfach Erfolg
      return { success: true, message: 'Du bist bereits angemeldet!' };
    }

    // Neuen Subscriber erstellen
    const unsubscribeToken = randomUUID();
    const confirmToken = randomUUID();

    await this.db.insert(newsletterSubscribers).values({
      tenantId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      status: 'active', // Direkt aktiv (kein Double-Opt-In für MVP)
      source: data.source || 'website',
      subscribedAt: new Date(),
      unsubscribeToken,
      confirmToken,
    });

    return { success: true, message: 'Erfolgreich angemeldet! 🎉' };
  }

  // ==================== CONTACT FORM ✅ NEU ====================
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

    // Kontaktanfrage in email_logs speichern (als "contact-form" Template)
    await this.db.insert(emailLogs).values({
      tenantId,
      to: 'contact-form',
      from: data.email,
      subject: data.subject || `Kontaktanfrage von ${data.name}`,
      template: 'contact-form',
      status: 'received',
      // Nachricht + Details im error-Feld speichern (text-Feld, unbegrenzt)
      error: JSON.stringify({
        name: data.name,
        email: data.email,
        message: data.message,
        phone: data.phone,
        submittedAt: new Date().toISOString(),
      }),
    });

    console.log(
      `📬 Contact form from ${data.name} (${data.email}) for tenant ${tenantSlug}`,
    );

    return {
      success: true,
      message: 'Deine Nachricht wurde gesendet! Wir melden uns bald.',
    };
  }
}
