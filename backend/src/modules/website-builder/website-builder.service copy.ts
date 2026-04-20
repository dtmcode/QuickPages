// 📂 PFAD: backend/src/modules/website-builder/website-builder.service.ts

/**
 * 🎨 WEBSITE BUILDER SERVICE
 * Service mit Drizzle Queries (Multi-Tenant)
 */

import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import {
  wbTemplates,
  wbPages,
  wbSections,
  wbGlobalTemplates,
  wbGlobalTemplatePages,
  wbGlobalTemplateSections,
} from '../../drizzle/website-builder.schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { CreateTemplateInput } from './dto/create-template.input';
import { UpdateTemplateInput } from './dto/update-template.input';
import { CreatePageInput } from './dto/create-page.input';
import { UpdatePageInput } from './dto/update-page.input';
import { CreateSectionInput } from './dto/create-section.input';
import { UpdateSectionInput } from './dto/update-section.input';
import { WbGlobalSection } from './entities/wb-global-section.entity';
import { PRESETS, impressumPreset, datenschutzPreset, FreestyleSection, CustomSection } from './helpers/preset-library';

@Injectable()
export class WebsiteBuilderService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ==================== GLOBAL TEMPLATES ====================

  async findAllGlobalTemplates(limit?: number) {
    const results = await this.db
      .select()
      .from(wbGlobalTemplates)
      .where(eq(wbGlobalTemplates.isActive, true))
      .orderBy(desc(wbGlobalTemplates.createdAt));

    return limit ? results.slice(0, limit) : results;
  }

  async findOneGlobalTemplate(id: string) {
    const [template] = await this.db
      .select()
      .from(wbGlobalTemplates)
      .where(eq(wbGlobalTemplates.id, id));

    return template || null;
  }

  async cloneGlobalTemplate(globalTemplateId: string, tenantId: string) {
    // 1. Get Global Template
    const globalTemplate = await this.findOneGlobalTemplate(globalTemplateId);
    if (!globalTemplate) {
      throw new NotFoundException('Global Template not found');
    }

    // 2. Create Tenant Template
    const [newTemplate] = await this.db
      .insert(wbTemplates)
      .values({
        tenantId,
        globalTemplateId,
        name: globalTemplate.name,
        description: globalTemplate.description,
        thumbnailUrl: globalTemplate.thumbnailUrl,
        isActive: true,
        isDefault: false,
        settings: globalTemplate.settings || {},
      })
      .returning();

    // 3. Get Global Template Pages
    const globalPages = await this.db
      .select()
      .from(wbGlobalTemplatePages)
      .where(eq(wbGlobalTemplatePages.templateId, globalTemplateId))
      .orderBy(asc(wbGlobalTemplatePages.order));

    // 4. Clone Pages & Sections
    for (const globalPage of globalPages) {
      const [newPage] = await this.db
        .insert(wbPages)
        .values({
          tenantId,
          templateId: newTemplate.id,
          name: globalPage.name,
          slug: globalPage.slug,
          description: globalPage.description,
          isActive: true,
          isHomepage: globalPage.isHomepage,
          order: globalPage.order,
          settings: {},
        })
        .returning();

      // Get sections for this page
      const globalSections = await this.db
        .select()
        .from(wbGlobalTemplateSections)
        .where(eq(wbGlobalTemplateSections.pageId, globalPage.id))
        .orderBy(asc(wbGlobalTemplateSections.order));

      // Clone sections
      for (const globalSection of globalSections) {
        await this.db.insert(wbSections).values({
          tenantId: tenantId,
          pageId: newPage.id,
          name: globalSection.name,
          type: globalSection.type as any,
          order: globalSection.order,
          isActive: true,
          content: globalSection.content || {},
          styling: globalSection.styling || null,
        });
      }
    }

    // 5. Return complete template
    return this.findOneTemplate(newTemplate.id, tenantId);
  }

  // ==================== TEMPLATES ====================

  async createTemplate(tenantId: string, input: CreateTemplateInput) {
    console.log('🔵 Service createTemplate:', { tenantId, input });

    const [template] = await this.db
      .insert(wbTemplates)
      .values({
        tenantId,
        name: input.name,
        description: input.description,
        thumbnailUrl: input.thumbnailUrl,
        isActive: input.isActive ?? true,
        isDefault: input.isDefault ?? false,
        settings: input.settings || {},
      })
      .returning();

    return template;
  }

  async findAllTemplates(tenantId: string) {
    const templates = await this.db.query.wbTemplates.findMany({
      where: eq(wbTemplates.tenantId, tenantId),
      with: {
        pages: {
          orderBy: asc(wbPages.order),
          with: {
            sections: {
              orderBy: asc(wbSections.order),
            },
          },
        },
      },
      orderBy: desc(wbTemplates.createdAt),
    });

    return templates;
  }

  async findOneTemplate(id: string, tenantId: string) {
    const template = await this.db.query.wbTemplates.findFirst({
      where: and(eq(wbTemplates.id, id), eq(wbTemplates.tenantId, tenantId)),
      with: {
        pages: {
          orderBy: asc(wbPages.order),
          with: {
            sections: {
              orderBy: asc(wbSections.order),
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async findDefaultTemplate(tenantId: string) {
    const template = await this.db.query.wbTemplates.findFirst({
      where: and(
        eq(wbTemplates.tenantId, tenantId),
        eq(wbTemplates.isDefault, true),
      ),
      with: {
        pages: {
          orderBy: asc(wbPages.order),
          with: {
            sections: {
              orderBy: asc(wbSections.order),
            },
          },
        },
      },
    });

    return template || null;
  }

  async updateTemplate(
    id: string,
    tenantId: string,
    input: UpdateTemplateInput,
  ) {
    await this.findOneTemplate(id, tenantId);

    const [updated] = await this.db
      .update(wbTemplates)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(wbTemplates.id, id), eq(wbTemplates.tenantId, tenantId)))
      .returning();

    return updated;
  }

  async deleteTemplate(id: string, tenantId: string) {
    await this.findOneTemplate(id, tenantId);

    await this.db
      .delete(wbTemplates)
      .where(and(eq(wbTemplates.id, id), eq(wbTemplates.tenantId, tenantId)));

    return true;
  }

  async cloneTemplate(id: string, tenantId: string, newName?: string) {
    const original = await this.findOneTemplate(id, tenantId);

    const [cloned] = await this.db
      .insert(wbTemplates)
      .values({
        tenantId,
        name: newName || `${original.name} (Copy)`,
        description: original.description,
        thumbnailUrl: original.thumbnailUrl,
        isActive: original.isActive,
        isDefault: false,
        settings: original.settings,
      })
      .returning();

    for (const page of original.pages) {
      const [clonedPage] = await this.db
        .insert(wbPages)
        .values({
          tenantId,
          templateId: cloned.id,
          name: page.name,
          slug: page.slug,
          description: page.description,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          metaKeywords: page.metaKeywords,
          isActive: page.isActive,
          isHomepage: page.isHomepage,
          order: page.order,
          settings: page.settings,
        })
        .returning();

      for (const section of page.sections) {
        await this.db.insert(wbSections).values({
          tenantId,
          pageId: clonedPage.id,
          name: section.name,
          type: section.type,
          order: section.order,
          isActive: section.isActive,
          content: section.content,
          styling: section.styling,
        });
      }
    }

    return this.findOneTemplate(cloned.id, tenantId);
  }

  async setAsDefaultTemplate(id: string, tenantId: string) {
    await this.findOneTemplate(id, tenantId);

    await this.db
      .update(wbTemplates)
      .set({ isDefault: false })
      .where(eq(wbTemplates.tenantId, tenantId));

    const [updated] = await this.db
      .update(wbTemplates)
      .set({ isDefault: true })
      .where(and(eq(wbTemplates.id, id), eq(wbTemplates.tenantId, tenantId)))
      .returning();

    return updated;
  }

  // ==================== PAGES ====================

  async createPage(tenantId: string, input: CreatePageInput) {
    await this.findOneTemplate(input.templateId, tenantId);

    const existing = await this.db.query.wbPages.findFirst({
      where: and(
        eq(wbPages.tenantId, tenantId),
        eq(wbPages.templateId, input.templateId),
        eq(wbPages.slug, input.slug),
      ),
    });

    if (existing) {
      throw new ConflictException(
        `Page with slug "${input.slug}" already exists in this template`,
      );
    }

    const [page] = await this.db
      .insert(wbPages)
      .values({
        tenantId,
        templateId: input.templateId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        metaKeywords: input.metaKeywords,
        isActive: input.isActive ?? true,
        isHomepage: input.isHomepage ?? false,
        order: input.order ?? 0,
        settings: input.settings || {},
      })
      .returning();

    return page;
  }

  async findAllPages(tenantId: string, templateId?: string) {
    const pages = await this.db.query.wbPages.findMany({
      where: templateId
        ? and(
            eq(wbPages.tenantId, tenantId),
            eq(wbPages.templateId, templateId),
          )
        : eq(wbPages.tenantId, tenantId),
      with: {
        sections: {
          orderBy: asc(wbSections.order),
        },
      },
      orderBy: asc(wbPages.order),
    });

    return pages;
  }

  async findOnePage(id: string, tenantId: string) {
    const page = await this.db.query.wbPages.findFirst({
      where: and(eq(wbPages.id, id), eq(wbPages.tenantId, tenantId)),
      with: {
        sections: {
          orderBy: asc(wbSections.order),
        },
        template: true,
      },
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return page;
  }

  async findPageBySlug(slug: string, tenantId: string, templateId?: string) {
    const page = await this.db.query.wbPages.findFirst({
      where: templateId
        ? and(
            eq(wbPages.tenantId, tenantId),
            eq(wbPages.templateId, templateId),
            eq(wbPages.slug, slug),
          )
        : and(eq(wbPages.tenantId, tenantId), eq(wbPages.slug, slug)),
      with: {
        sections: {
          where: eq(wbSections.isActive, true),
          orderBy: asc(wbSections.order),
        },
      },
    });

    return page || null;
  }

  async findHomepage(tenantId: string, templateId: string) {
    const page = await this.db.query.wbPages.findFirst({
      where: and(
        eq(wbPages.tenantId, tenantId),
        eq(wbPages.templateId, templateId),
        eq(wbPages.isHomepage, true),
      ),
      with: {
        sections: {
          where: eq(wbSections.isActive, true),
          orderBy: asc(wbSections.order),
        },
      },
    });

    return page || null;
  }

  async updatePage(id: string, tenantId: string, input: UpdatePageInput) {
    await this.findOnePage(id, tenantId);

    if (input.slug) {
      const existing = await this.db.query.wbPages.findFirst({
        where: and(
          eq(wbPages.tenantId, tenantId),
          eq(wbPages.slug, input.slug),
        ),
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Page with slug "${input.slug}" already exists`,
        );
      }
    }

    const [updated] = await this.db
      .update(wbPages)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(wbPages.id, id), eq(wbPages.tenantId, tenantId)))
      .returning();

    return updated;
  }

  async deletePage(id: string, tenantId: string) {
    await this.findOnePage(id, tenantId);

    await this.db
      .delete(wbPages)
      .where(and(eq(wbPages.id, id), eq(wbPages.tenantId, tenantId)));

    return true;
  }

  async reorderSections(
    pageId: string,
    tenantId: string,
    sectionIds: string[],
  ) {
    await this.findOnePage(pageId, tenantId);

    for (let i = 0; i < sectionIds.length; i++) {
      await this.db
        .update(wbSections)
        .set({ order: i })
        .where(
          and(
            eq(wbSections.id, sectionIds[i]),
            eq(wbSections.pageId, pageId),
            eq(wbSections.tenantId, tenantId),
          ),
        );
    }

    return this.findOnePage(pageId, tenantId);
  }

  // ==================== SECTIONS ====================

  async createSection(tenantId: string, input: CreateSectionInput) {
    await this.findOnePage(input.pageId, tenantId);

    const [section] = await this.db
      .insert(wbSections)
      .values({
        tenantId,
        pageId: input.pageId,
        name: input.name,
        type: input.type,
        order: input.order ?? 0,
        isActive: input.isActive ?? true,
        content: input.content || {},
        styling: input.styling || null,
      })
      .returning();

    return section;
  }

  async findAllSections(tenantId: string, pageId?: string) {
    const sections = await this.db.query.wbSections.findMany({
      where: pageId
        ? and(eq(wbSections.tenantId, tenantId), eq(wbSections.pageId, pageId))
        : eq(wbSections.tenantId, tenantId),
      orderBy: asc(wbSections.order),
    });

    return sections;
  }

  async findOneSection(id: string, tenantId: string) {
    const section = await this.db.query.wbSections.findFirst({
      where: and(eq(wbSections.id, id), eq(wbSections.tenantId, tenantId)),
      with: {
        page: true,
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async updateSection(id: string, tenantId: string, input: UpdateSectionInput) {
    await this.findOneSection(id, tenantId);

    const [updated] = await this.db
      .update(wbSections)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(wbSections.id, id), eq(wbSections.tenantId, tenantId)))
      .returning();

    return updated;
  }

  async deleteSection(id: string, tenantId: string) {
    await this.findOneSection(id, tenantId);

    await this.db
      .delete(wbSections)
      .where(and(eq(wbSections.id, id), eq(wbSections.tenantId, tenantId)));

    return true;
  }

  async duplicateSection(id: string, tenantId: string) {
    const original = await this.findOneSection(id, tenantId);

    const [duplicated] = await this.db
      .insert(wbSections)
      .values({
        tenantId,
        pageId: original.pageId,
        name: `${original.name} (Copy)`,
        type: original.type,
        order: original.order + 1,
        isActive: original.isActive,
        content: original.content,
        styling: original.styling,
      })
      .returning();

    return duplicated;
  }

  async toggleSectionVisibility(id: string, tenantId: string) {
    const section = await this.findOneSection(id, tenantId);

    const [updated] = await this.db
      .update(wbSections)
      .set({ isActive: !section.isActive })
      .where(and(eq(wbSections.id, id), eq(wbSections.tenantId, tenantId)))
      .returning();

    return updated;
  }

  async moveSection(id: string, tenantId: string, targetPageId: string) {
    await this.findOneSection(id, tenantId);
    await this.findOnePage(targetPageId, tenantId);

    const [moved] = await this.db
      .update(wbSections)
      .set({ pageId: targetPageId })
      .where(and(eq(wbSections.id, id), eq(wbSections.tenantId, tenantId)))
      .returning();

    return moved;
  }
  // ==================== GLOBAL SECTIONS ====================

  async findAllGlobalSections() {
    const sections = await this.db
      .select()
      .from(wbGlobalTemplateSections)
      .orderBy(asc(wbGlobalTemplateSections.order));

    return sections;
  }

  async findOneGlobalSection(id: string) {
    const [section] = await this.db
      .select()
      .from(wbGlobalTemplateSections)
      .where(eq(wbGlobalTemplateSections.id, id));

    return section || null;
  }

  async cloneGlobalSection(
    globalSectionId: string,
    pageId: string,
    tenantId: string,
  ) {
    // 1. Get Global Section
    const globalSection = await this.findOneGlobalSection(globalSectionId);
    if (!globalSection) {
      throw new NotFoundException('Global Section not found');
    }

    // 2. Verify Page exists
    await this.findOnePage(pageId, tenantId);

    // 3. Get current section count for order
    const existingSections = await this.findAllSections(tenantId, pageId);
    const newOrder = existingSections.length;

    // 4. Clone Section
    const [newSection] = await this.db
      .insert(wbSections)
      .values({
        tenantId,
        pageId,
        name: globalSection.name,
        type: globalSection.type as any,
        order: newOrder,
        isActive: true,
        content: globalSection.content || {},
        styling: globalSection.styling || null,
      })
      .returning();

    return newSection;
  }
  // ==================== DEFAULT TEMPLATE BEI REGISTRATION ====================

  /**
   * Wird automatisch nach der Registration aufgerufen.
   * Erstellt ein passendes Default-Template je nach Paket.
   *
   * page/landing  → 1 Seite (Homepage) mit Hero
   * creator       → 3 Seiten (Home, About, Kontakt)
   * business+     → 5 Seiten (Home, About, Services, Blog, Kontakt)
   */
  async createDefaultTemplate(
    tenantId: string,
    tenantName: string,
    packageType: string,
  ): Promise<typeof wbTemplates.$inferSelect> {
    // ─── Package → Kategorie Mapping ────────────────────────────────────────────
    const getPackageCategory = (
      pkg: string,
    ):
      | 'website'
      | 'blog'
      | 'business'
      | 'shop'
      | 'members'
      | 'restaurant'
      | 'local'
      | 'funnels' => {
      if (pkg.startsWith('website_')) return 'website';
      if (pkg.startsWith('blog_')) return 'blog';
      if (pkg.startsWith('business_')) return 'business';
      if (pkg.startsWith('shop_')) return 'shop';
      if (pkg.startsWith('members_')) return 'members';
      if (pkg.startsWith('restaurant_')) return 'restaurant';
      if (pkg.startsWith('local_')) return 'local';
      if (pkg.startsWith('funnels_')) return 'funnels';
      // Fallback für alte Paketnamen
      if (['starter', 'landing', 'page', 'website_micro'].includes(pkg))
        return 'website';
      if (['creator', 'business_starter'].includes(pkg)) return 'business';
      if (['shop', 'shop_mini'].includes(pkg)) return 'shop';
      if (['professional', 'enterprise'].includes(pkg)) return 'business';
      return 'website';
    };

    const category = getPackageCategory(packageType);

    // ─── Seiten-Konfiguration nach Kategorie ────────────────────────────────────

    type PageConfig = {
      name: string;
      slug: string;
      isHomepage: boolean;
      order: number;
      sections: Array<{
        name: string;
        type: string;
        content: Record<string, unknown>;
      }>;
    };

    const pageConfigs: PageConfig[] = [];

    // ── WEBSITE: Visitenkarte / Professioneller Auftritt ─────────────────────
    if (category === 'website') {
      pageConfigs.push({
        name: 'Startseite',
        slug: 'home',
        isHomepage: true,
        order: 0,
        sections: [
          {
            name: 'Hero',
            type: 'hero',
            content: {
              heading: `Willkommen bei ${tenantName}`,
              subheading:
                'Ihr professioneller Webauftritt — modern, schnell und DSGVO-konform.',
              buttonText: 'Mehr erfahren',
              buttonLink: '#kontakt',
            },
          },
          {
            name: 'Features',
            type: 'features',
            content: {
              title: 'Warum wir?',
              subtitle: 'Das zeichnet uns aus',
              items: [
                {
                  title: 'Qualität',
                  description: 'Höchste Standards bei allem was wir tun.',
                  icon: '⭐',
                },
                {
                  title: 'Erfahrung',
                  description: 'Jahrelange Expertise in unserem Bereich.',
                  icon: '🏆',
                },
                {
                  title: 'Service',
                  description: 'Persönliche Betreuung und schnelle Reaktion.',
                  icon: '💬',
                },
              ],
            },
          },
        ],
      });

      // Standard + Pro: mehr Seiten
      if (['website_standard', 'website_pro'].includes(packageType)) {
        pageConfigs.push(
          {
            name: 'Über uns',
            slug: 'ueber-uns',
            isHomepage: false,
            order: 1,
            sections: [
              {
                name: 'Über uns',
                type: 'about',
                content: {
                  title: `Über ${tenantName}`,
                  description:
                    'Hier erzählen wir unsere Geschichte und was uns antreibt.',
                },
              },
            ],
          },
          {
            name: 'Kontakt',
            slug: 'kontakt',
            isHomepage: false,
            order: 2,
            sections: [
              {
                name: 'Kontakt',
                type: 'contact',
                content: {
                  title: 'Kontakt aufnehmen',
                  subtitle: 'Wir freuen uns von Ihnen zu hören.',
                },
              },
            ],
          },
        );
      }
    }

    // ── BLOG: Publishing / Creator ───────────────────────────────────────────
    else if (category === 'blog') {
      pageConfigs.push(
        {
          name: 'Startseite',
          slug: 'home',
          isHomepage: true,
          order: 0,
          sections: [
            {
              name: 'Hero',
              type: 'hero',
              content: {
                heading: tenantName,
                subheading: 'Aktuelle Beiträge, Insights und mehr.',
                buttonText: 'Zum Blog',
                buttonLink: '/blog',
              },
            },
            {
              name: 'Blog Feed',
              type: 'blog',
              content: { title: 'Neueste Beiträge', showCount: 6 },
            },
          ],
        },
        {
          name: 'Über mich',
          slug: 'ueber-mich',
          isHomepage: false,
          order: 1,
          sections: [
            {
              name: 'Über mich',
              type: 'about',
              content: {
                title: `Hallo, ich bin ${tenantName}`,
                description:
                  'Hier erzählst du etwas über dich und dein Blog-Thema.',
              },
            },
          ],
        },
        {
          name: 'Kontakt',
          slug: 'kontakt',
          isHomepage: false,
          order: 2,
          sections: [
            {
              name: 'Kontakt',
              type: 'contact',
              content: {
                title: 'Schreib mir',
                subtitle: 'Fragen, Kooperationen oder einfach Hallo.',
              },
            },
          ],
        },
      );
    }

    // ── BUSINESS: Dienstleister / Termine / Kunden ───────────────────────────
    else if (category === 'business') {
      pageConfigs.push(
        {
          name: 'Startseite',
          slug: 'home',
          isHomepage: true,
          order: 0,
          sections: [
            {
              name: 'Hero',
              type: 'hero',
              content: {
                heading: `${tenantName}`,
                subheading:
                  'Professionelle Dienstleistungen — Termine online buchen.',
                buttonText: 'Termin buchen',
                buttonLink: '/booking',
              },
            },
            {
              name: 'Leistungen',
              type: 'features',
              content: {
                title: 'Unsere Leistungen',
                subtitle: 'Was wir für Sie tun können',
                items: [
                  {
                    title: 'Leistung 1',
                    description: 'Beschreibung Ihrer ersten Dienstleistung.',
                    icon: '✅',
                  },
                  {
                    title: 'Leistung 2',
                    description: 'Beschreibung Ihrer zweiten Dienstleistung.',
                    icon: '🎯',
                  },
                  {
                    title: 'Leistung 3',
                    description: 'Beschreibung Ihrer dritten Dienstleistung.',
                    icon: '⚡',
                  },
                ],
              },
            },
            {
              name: 'Booking CTA',
              type: 'cta',
              content: {
                title: 'Bereit für einen Termin?',
                subtitle: 'Einfach online buchen — in weniger als 2 Minuten.',
                buttonText: 'Jetzt buchen',
                buttonLink: '/booking',
              },
            },
          ],
        },
        {
          name: 'Über uns',
          slug: 'ueber-uns',
          isHomepage: false,
          order: 1,
          sections: [
            {
              name: 'Über uns',
              type: 'about',
              content: {
                title: `Über ${tenantName}`,
                description: 'Unser Team und unsere Geschichte.',
              },
            },
          ],
        },
        {
          name: 'Kontakt',
          slug: 'kontakt',
          isHomepage: false,
          order: 2,
          sections: [
            {
              name: 'Kontakt',
              type: 'contact',
              content: {
                title: 'Kontakt aufnehmen',
                subtitle: 'Wir antworten innerhalb von 24 Stunden.',
              },
            },
          ],
        },
      );
    }

    // ── SHOP: Online-Handel ──────────────────────────────────────────────────
    else if (category === 'shop') {
      pageConfigs.push(
        {
          name: 'Startseite',
          slug: 'home',
          isHomepage: true,
          order: 0,
          sections: [
            {
              name: 'Hero',
              type: 'hero',
              content: {
                heading: `Willkommen im ${tenantName} Shop`,
                subheading:
                  'Entdecke unsere Produkte — sicher & bequem bestellen.',
                buttonText: 'Jetzt shoppen',
                buttonLink: '/shop',
              },
            },
            {
              name: 'Produkte',
              type: 'features',
              content: {
                title: 'Unsere Bestseller',
                subtitle: 'Die beliebtesten Produkte',
                items: [
                  {
                    title: 'Produkt 1',
                    description: 'Kurze Produktbeschreibung.',
                    icon: '📦',
                  },
                  {
                    title: 'Produkt 2',
                    description: 'Kurze Produktbeschreibung.',
                    icon: '🎁',
                  },
                  {
                    title: 'Produkt 3',
                    description: 'Kurze Produktbeschreibung.',
                    icon: '⭐',
                  },
                ],
              },
            },
            {
              name: 'Shop CTA',
              type: 'cta',
              content: {
                title: 'Alle Produkte entdecken',
                subtitle:
                  'Versandkostenfrei ab 50€ · Sichere Zahlung · 30 Tage Rückgabe',
                buttonText: 'Zum Shop',
                buttonLink: '/shop',
              },
            },
          ],
        },
        {
          name: 'Über uns',
          slug: 'ueber-uns',
          isHomepage: false,
          order: 1,
          sections: [
            {
              name: 'Über uns',
              type: 'about',
              content: {
                title: `Über ${tenantName}`,
                description: 'Unser Unternehmen und unsere Geschichte.',
              },
            },
          ],
        },
        {
          name: 'Kontakt',
          slug: 'kontakt',
          isHomepage: false,
          order: 2,
          sections: [
            {
              name: 'Kontakt',
              type: 'contact',
              content: {
                title: 'Kontakt & Support',
                subtitle: 'Bei Fragen zu Ihrer Bestellung helfen wir gern.',
              },
            },
          ],
        },
      );
    }

    // ── MEMBERS: Community / Kurse / Membership ──────────────────────────────
    else if (category === 'members') {
      pageConfigs.push(
        {
          name: 'Startseite',
          slug: 'home',
          isHomepage: true,
          order: 0,
          sections: [
            {
              name: 'Hero',
              type: 'hero',
              content: {
                heading: `Willkommen bei ${tenantName}`,
                subheading:
                  'Exklusive Inhalte, Community und Kurse — alles an einem Ort.',
                buttonText: 'Mitglied werden',
                buttonLink: '#mitgliedschaft',
              },
            },
            {
              name: 'Features',
              type: 'features',
              content: {
                title: 'Was du bekommst',
                subtitle: 'Deine Mitgliedschaft beinhaltet',
                items: [
                  {
                    title: 'Exklusive Inhalte',
                    description: 'Zugang zu allen Kursen und Materialien.',
                    icon: '🔐',
                  },
                  {
                    title: 'Community',
                    description: 'Vernetze dich mit Gleichgesinnten.',
                    icon: '👥',
                  },
                  {
                    title: 'Live-Sessions',
                    description: 'Regelmäßige Q&A und Workshops.',
                    icon: '🎥',
                  },
                ],
              },
            },
            {
              name: 'CTA',
              type: 'cta',
              content: {
                title: 'Bereit einzusteigen?',
                subtitle: 'Wähle dein Mitgliedschaftsmodell und starte heute.',
                buttonText: 'Jetzt Mitglied werden',
                buttonLink: '#mitgliedschaft',
              },
            },
          ],
        },
        {
          name: 'Über uns',
          slug: 'ueber-uns',
          isHomepage: false,
          order: 1,
          sections: [
            {
              name: 'Über uns',
              type: 'about',
              content: {
                title: `Über ${tenantName}`,
                description: 'Unsere Mission und was uns antreibt.',
              },
            },
          ],
        },
        {
          name: 'Kontakt',
          slug: 'kontakt',
          isHomepage: false,
          order: 2,
          sections: [
            {
              name: 'Kontakt',
              type: 'contact',
              content: {
                title: 'Fragen zur Mitgliedschaft?',
                subtitle: 'Wir helfen dir gern weiter.',
              },
            },
          ],
        },
      );
    }
    // ── RESTAURANT: Gastronomie ──────────────────────────────────────────────
    else if (category === 'restaurant') {
      pageConfigs.push(
        {
          name: 'Startseite',
          slug: 'home',
          isHomepage: true,
          order: 0,
          sections: [
            {
              name: 'Hero',
              type: 'hero',
              content: {
                heading: `Willkommen bei ${tenantName}`,
                subheading:
                  'Frische Küche, einfach bestellen — Tisch reservieren oder direkt online bestellen.',
                buttonText: 'Jetzt bestellen',
                buttonLink: '/bestellen',
              },
            },
            {
              name: 'Speisekarte',
              type: 'features',
              content: {
                title: 'Unsere Speisekarte',
                subtitle: 'Frische Zutaten, ehrliche Küche',
                items: [
                  {
                    title: 'Vorspeisen',
                    description: 'Leichte Starters für den perfekten Einstieg.',
                    icon: '🥗',
                  },
                  {
                    title: 'Hauptgerichte',
                    description: 'Sorgfältig zubereitete Hauptspeisen.',
                    icon: '🍽️',
                  },
                  {
                    title: 'Desserts',
                    description: 'Süße Abschlüsse für jeden Geschmack.',
                    icon: '🍰',
                  },
                ],
              },
            },
            {
              name: 'Reservierung CTA',
              type: 'cta',
              content: {
                title: 'Tisch reservieren',
                subtitle: 'Online buchen — schnell, einfach, verbindlich.',
                buttonText: 'Jetzt reservieren',
                buttonLink: '/reservierung',
              },
            },
          ],
        },
        {
          name: 'Über uns',
          slug: 'ueber-uns',
          isHomepage: false,
          order: 1,
          sections: [
            {
              name: 'Über uns',
              type: 'about',
              content: {
                title: `Über ${tenantName}`,
                description: 'Unsere Geschichte, unsere Küche, unser Team.',
              },
            },
          ],
        },
        {
          name: 'Kontakt',
          slug: 'kontakt',
          isHomepage: false,
          order: 2,
          sections: [
            {
              name: 'Kontakt',
              type: 'contact',
              content: {
                title: 'Kontakt & Öffnungszeiten',
                subtitle: 'Wir freuen uns auf Ihren Besuch.',
              },
            },
          ],
        },
      );
    }

    // ── LOCAL: Lokaler Händler ───────────────────────────────────────────────
    else if (category === 'local') {
      pageConfigs.push(
        {
          name: 'Startseite',
          slug: 'home',
          isHomepage: true,
          order: 0,
          sections: [
            {
              name: 'Hero',
              type: 'hero',
              content: {
                heading: `${tenantName} — jetzt online bestellen`,
                subheading:
                  'Bequem vorbestellen, wunschtermin wählen und abholen — ohne Warteschlange.',
                buttonText: 'Jetzt vorbestellen',
                buttonLink: '/bestellen',
              },
            },
            {
              name: 'Sortiment',
              type: 'features',
              content: {
                title: 'Unser Sortiment',
                subtitle: 'Regional, frisch, für Sie',
                items: [
                  {
                    title: 'Kategorie 1',
                    description: 'Beschreibung Ihrer ersten Produktkategorie.',
                    icon: '🛒',
                  },
                  {
                    title: 'Kategorie 2',
                    description: 'Beschreibung Ihrer zweiten Produktkategorie.',
                    icon: '📦',
                  },
                  {
                    title: 'Kategorie 3',
                    description: 'Beschreibung Ihrer dritten Produktkategorie.',
                    icon: '⭐',
                  },
                ],
              },
            },
            {
              name: 'Click & Collect CTA',
              type: 'cta',
              content: {
                title: "Click & Collect — so einfach geht's",
                subtitle:
                  'Online bestellen → Abholtermin wählen → fertig. Kein Warten, keine Schlange.',
                buttonText: 'Abholtermin buchen',
                buttonLink: '/bestellen',
              },
            },
          ],
        },
        {
          name: 'Über uns',
          slug: 'ueber-uns',
          isHomepage: false,
          order: 1,
          sections: [
            {
              name: 'Über uns',
              type: 'about',
              content: {
                title: `Über ${tenantName}`,
                description: 'Unser Geschäft, unsere Geschichte, unsere Werte.',
              },
            },
          ],
        },
        {
          name: 'Kontakt',
          slug: 'kontakt',
          isHomepage: false,
          order: 2,
          sections: [
            {
              name: 'Kontakt',
              type: 'contact',
              content: {
                title: 'Kontakt & Öffnungszeiten',
                subtitle: 'Wir sind für Sie da.',
              },
            },
          ],
        },
      );
    }

    // ── FUNNELS: Lead-Generierung / Marketing ────────────────────────────────
    else if (category === 'funnels') {
      pageConfigs.push(
        {
          name: 'Startseite',
          slug: 'home',
          isHomepage: true,
          order: 0,
          sections: [
            {
              name: 'Hero',
              type: 'hero',
              content: {
                heading: `${tenantName}`,
                subheading:
                  'Generiere qualifizierte Leads und wandle Besucher in Kunden um.',
                buttonText: 'Jetzt kostenlos starten',
                buttonLink: '#optin',
              },
            },
            {
              name: 'Benefits',
              type: 'features',
              content: {
                title: 'Was du bekommst',
                subtitle: 'Alles was du für mehr Conversions brauchst',
                items: [
                  {
                    title: 'Mehr Leads',
                    description: 'Optimierte Opt-in Seiten die konvertieren.',
                    icon: '🎯',
                  },
                  {
                    title: 'Automatisierung',
                    description: 'Follow-up Sequenzen die automatisch laufen.',
                    icon: '⚡',
                  },
                  {
                    title: 'Analytics',
                    description: 'Verstehe wo deine Leads herkommen.',
                    icon: '📊',
                  },
                ],
              },
            },
            {
              name: 'Opt-in CTA',
              type: 'cta',
              content: {
                title: 'Bereit für mehr Kunden?',
                subtitle: 'Starte jetzt und sieh wie dein Business wächst.',
                buttonText: 'Kostenlos testen',
                buttonLink: '#optin',
              },
            },
          ],
        },
        {
          name: 'Über uns',
          slug: 'ueber-uns',
          isHomepage: false,
          order: 1,
          sections: [
            {
              name: 'Über uns',
              type: 'about',
              content: {
                title: `Über ${tenantName}`,
                description: 'Wer wir sind und warum wir dir helfen können.',
              },
            },
          ],
        },
        {
          name: 'Kontakt',
          slug: 'kontakt',
          isHomepage: false,
          order: 2,
          sections: [
            {
              name: 'Kontakt',
              type: 'contact',
              content: {
                title: 'Kontakt aufnehmen',
                subtitle: 'Fragen? Wir antworten innerhalb von 24 Stunden.',
              },
            },
          ],
        },
      );
    }
    // ─── Legal Pages (immer für alle Pakete) ────────────────────────────────────
    pageConfigs.push(
      {
        name: 'Impressum',
        slug: 'impressum',
        isHomepage: false,
        order: 100,
        sections: [
          {
            name: 'Impressum',
            type: 'text',
            content: {
              text: `# Impressum\n\n**${tenantName}**\n\n> ⚠️ Bitte ergänze deine vollständigen Angaben (Adresse, Telefon, E-Mail, ggf. Handelsregisternummer und USt-IdNr.) im Website Builder.`,
            },
          },
        ],
      },
      {
        name: 'Datenschutz',
        slug: 'datenschutz',
        isHomepage: false,
        order: 101,
        sections: [
          {
            name: 'Datenschutz',
            type: 'text',
            content: {
              text: `# Datenschutzerklärung\n\n**Verantwortlicher:** ${tenantName}\n\n> ⚠️ Bitte ergänze deine vollständigen Kontaktdaten und passe diese Datenschutzerklärung an deine tatsächliche Datenverarbeitung an. Im Onboarding-Wizard werden deine Daten automatisch eingetragen.`,
            },
          },
        ],
      },
    );

    // ─── Template anlegen ────────────────────────────────────────────────────────

    const templateName =
      category === 'website'
        ? 'Meine Website'
        : category === 'blog'
          ? 'Mein Blog'
          : category === 'business'
            ? 'Mein Business'
            : category === 'shop'
              ? 'Mein Shop'
              : category === 'members'
                ? 'Meine Community'
                : category === 'restaurant'
                  ? 'Mein Restaurant'
                  : category === 'local'
                    ? 'Mein Laden'
                    : category === 'funnels'
                      ? 'Meine Funnels'
                      : 'Meine Website';

    const [template] = await this.db
      .insert(wbTemplates)
      .values({
        tenantId,
        name: templateName,
        description: `Standard-Template für ${packageType}`,
        isActive: true,
        isDefault: true,
        settings: {},
      })
      .returning();

    // ─── Seiten + Sections erstellen ────────────────────────────────────────────

    for (const pageConfig of pageConfigs) {
      const [page] = await this.db
        .insert(wbPages)
        .values({
          tenantId,
          templateId: template.id,
          name: pageConfig.name,
          slug: pageConfig.slug,
          isActive: true,
          isHomepage: pageConfig.isHomepage,
          order: pageConfig.order,
          settings: {},
        })
        .returning();

      for (let i = 0; i < pageConfig.sections.length; i++) {
        const s = pageConfig.sections[i];
        await this.db.insert(wbSections).values({
          tenantId,
          pageId: page.id,
          name: s.name,
          type: s.type as any,
          order: i,
          isActive: true,
          content: s.content,
          styling: null,
        });
      }
    }

    return template;
  }
}
