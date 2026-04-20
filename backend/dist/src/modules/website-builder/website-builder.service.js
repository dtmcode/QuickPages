"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteBuilderService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const website_builder_schema_1 = require("../../drizzle/website-builder.schema");
const drizzle_orm_1 = require("drizzle-orm");
const preset_library_1 = require("./helpers/preset-library");
let WebsiteBuilderService = class WebsiteBuilderService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAllGlobalTemplates(limit) {
        const results = await this.db
            .select()
            .from(website_builder_schema_1.wbGlobalTemplates)
            .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.isActive, true))
            .orderBy((0, drizzle_orm_1.desc)(website_builder_schema_1.wbGlobalTemplates.createdAt));
        return limit ? results.slice(0, limit) : results;
    }
    async findOneGlobalTemplate(id) {
        const [template] = await this.db
            .select()
            .from(website_builder_schema_1.wbGlobalTemplates)
            .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplates.id, id));
        return template || null;
    }
    async cloneGlobalTemplate(globalTemplateId, tenantId) {
        const globalTemplate = await this.findOneGlobalTemplate(globalTemplateId);
        if (!globalTemplate) {
            throw new common_1.NotFoundException('Global Template not found');
        }
        const [newTemplate] = await this.db
            .insert(website_builder_schema_1.wbTemplates)
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
        const globalPages = await this.db
            .select()
            .from(website_builder_schema_1.wbGlobalTemplatePages)
            .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplatePages.templateId, globalTemplateId))
            .orderBy((0, drizzle_orm_1.asc)(website_builder_schema_1.wbGlobalTemplatePages.order));
        for (const globalPage of globalPages) {
            const [newPage] = await this.db
                .insert(website_builder_schema_1.wbPages)
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
            const globalSections = await this.db
                .select()
                .from(website_builder_schema_1.wbGlobalTemplateSections)
                .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplateSections.pageId, globalPage.id))
                .orderBy((0, drizzle_orm_1.asc)(website_builder_schema_1.wbGlobalTemplateSections.order));
            for (const globalSection of globalSections) {
                await this.db.insert(website_builder_schema_1.wbSections).values({
                    tenantId,
                    pageId: newPage.id,
                    name: globalSection.name,
                    type: globalSection.type,
                    order: globalSection.order,
                    isActive: true,
                    content: (globalSection.content || {}),
                    styling: (globalSection.styling || null),
                });
            }
        }
        return this.findOneTemplate(newTemplate.id, tenantId);
    }
    async createTemplate(tenantId, input) {
        console.log('🔵 Service createTemplate:', { tenantId, input });
        const [template] = await this.db
            .insert(website_builder_schema_1.wbTemplates)
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
    async findAllTemplates(tenantId) {
        const templates = await this.db.query.wbTemplates.findMany({
            where: (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.tenantId, tenantId),
            with: {
                pages: {
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbPages.order),
                    with: {
                        sections: {
                            orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                        },
                    },
                },
            },
            orderBy: (0, drizzle_orm_1.desc)(website_builder_schema_1.wbTemplates.createdAt),
        });
        return templates;
    }
    async findOneTemplate(id, tenantId) {
        const template = await this.db.query.wbTemplates.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.tenantId, tenantId)),
            with: {
                pages: {
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbPages.order),
                    with: {
                        sections: {
                            orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                        },
                    },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template with ID ${id} not found`);
        }
        return template;
    }
    async findDefaultTemplate(tenantId) {
        const template = await this.db.query.wbTemplates.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.isDefault, true)),
            with: {
                pages: {
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbPages.order),
                    with: {
                        sections: {
                            orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                        },
                    },
                },
            },
        });
        return template || null;
    }
    async updateTemplate(id, tenantId, input) {
        await this.findOneTemplate(id, tenantId);
        const [updated] = await this.db
            .update(website_builder_schema_1.wbTemplates)
            .set({
            ...input,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.tenantId, tenantId)))
            .returning();
        return updated;
    }
    async deleteTemplate(id, tenantId) {
        await this.findOneTemplate(id, tenantId);
        await this.db
            .delete(website_builder_schema_1.wbTemplates)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.tenantId, tenantId)));
        return true;
    }
    async cloneTemplate(id, tenantId, newName) {
        const original = await this.findOneTemplate(id, tenantId);
        const [cloned] = await this.db
            .insert(website_builder_schema_1.wbTemplates)
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
                .insert(website_builder_schema_1.wbPages)
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
                await this.db.insert(website_builder_schema_1.wbSections).values({
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
    async setAsDefaultTemplate(id, tenantId) {
        await this.findOneTemplate(id, tenantId);
        await this.db
            .update(website_builder_schema_1.wbTemplates)
            .set({ isDefault: false })
            .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.tenantId, tenantId));
        const [updated] = await this.db
            .update(website_builder_schema_1.wbTemplates)
            .set({ isDefault: true })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbTemplates.tenantId, tenantId)))
            .returning();
        return updated;
    }
    async createPage(tenantId, input) {
        await this.findOneTemplate(input.templateId, tenantId);
        const existing = await this.db.query.wbPages.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, input.templateId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.slug, input.slug)),
        });
        if (existing) {
            throw new common_1.ConflictException(`Page with slug "${input.slug}" already exists in this template`);
        }
        const [page] = await this.db
            .insert(website_builder_schema_1.wbPages)
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
    async findAllPages(tenantId, templateId) {
        const pages = await this.db.query.wbPages.findMany({
            where: templateId
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, templateId))
                : (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId),
            with: {
                sections: {
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                },
            },
            orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbPages.order),
        });
        return pages;
    }
    async findOnePage(id, tenantId) {
        const page = await this.db.query.wbPages.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId)),
            with: {
                sections: {
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                },
                template: true,
            },
        });
        if (!page) {
            throw new common_1.NotFoundException(`Page with ID ${id} not found`);
        }
        return page;
    }
    async findPageBySlug(slug, tenantId, templateId) {
        const page = await this.db.query.wbPages.findFirst({
            where: templateId
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, templateId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.slug, slug))
                : (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.slug, slug)),
            with: {
                sections: {
                    where: (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.isActive, true),
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                },
            },
        });
        return page || null;
    }
    async findHomepage(tenantId, templateId) {
        const page = await this.db.query.wbPages.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.templateId, templateId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.isHomepage, true)),
            with: {
                sections: {
                    where: (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.isActive, true),
                    orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
                },
            },
        });
        return page || null;
    }
    async updatePage(id, tenantId, input) {
        await this.findOnePage(id, tenantId);
        if (input.slug) {
            const existing = await this.db.query.wbPages.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.slug, input.slug)),
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException(`Page with slug "${input.slug}" already exists`);
            }
        }
        const [updated] = await this.db
            .update(website_builder_schema_1.wbPages)
            .set({
            ...input,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId)))
            .returning();
        return updated;
    }
    async deletePage(id, tenantId) {
        await this.findOnePage(id, tenantId);
        await this.db
            .delete(website_builder_schema_1.wbPages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbPages.tenantId, tenantId)));
        return true;
    }
    async reorderSections(pageId, tenantId, sectionIds) {
        await this.findOnePage(pageId, tenantId);
        for (let i = 0; i < sectionIds.length; i++) {
            await this.db
                .update(website_builder_schema_1.wbSections)
                .set({ order: i })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.id, sectionIds[i]), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.pageId, pageId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.tenantId, tenantId)));
        }
        return this.findOnePage(pageId, tenantId);
    }
    async createSection(tenantId, input) {
        await this.findOnePage(input.pageId, tenantId);
        const [section] = await this.db
            .insert(website_builder_schema_1.wbSections)
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
    async findAllSections(tenantId, pageId) {
        const sections = await this.db.query.wbSections.findMany({
            where: pageId
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.tenantId, tenantId), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.pageId, pageId))
                : (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.tenantId, tenantId),
            orderBy: (0, drizzle_orm_1.asc)(website_builder_schema_1.wbSections.order),
        });
        return sections;
    }
    async findOneSection(id, tenantId) {
        const section = await this.db.query.wbSections.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.tenantId, tenantId)),
            with: {
                page: true,
            },
        });
        if (!section) {
            throw new common_1.NotFoundException(`Section with ID ${id} not found`);
        }
        return section;
    }
    async updateSection(id, tenantId, input) {
        await this.findOneSection(id, tenantId);
        const [updated] = await this.db
            .update(website_builder_schema_1.wbSections)
            .set({
            ...input,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.tenantId, tenantId)))
            .returning();
        return updated;
    }
    async deleteSection(id, tenantId) {
        await this.findOneSection(id, tenantId);
        await this.db
            .delete(website_builder_schema_1.wbSections)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.tenantId, tenantId)));
        return true;
    }
    async duplicateSection(id, tenantId) {
        const original = await this.findOneSection(id, tenantId);
        const [duplicated] = await this.db
            .insert(website_builder_schema_1.wbSections)
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
    async toggleSectionVisibility(id, tenantId) {
        const section = await this.findOneSection(id, tenantId);
        const [updated] = await this.db
            .update(website_builder_schema_1.wbSections)
            .set({ isActive: !section.isActive })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.tenantId, tenantId)))
            .returning();
        return updated;
    }
    async moveSection(id, tenantId, targetPageId) {
        await this.findOneSection(id, tenantId);
        await this.findOnePage(targetPageId, tenantId);
        const [moved] = await this.db
            .update(website_builder_schema_1.wbSections)
            .set({ pageId: targetPageId })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.id, id), (0, drizzle_orm_1.eq)(website_builder_schema_1.wbSections.tenantId, tenantId)))
            .returning();
        return moved;
    }
    async findAllGlobalSections() {
        const sections = await this.db
            .select()
            .from(website_builder_schema_1.wbGlobalTemplateSections)
            .orderBy((0, drizzle_orm_1.asc)(website_builder_schema_1.wbGlobalTemplateSections.order));
        return sections;
    }
    async findOneGlobalSection(id) {
        const [section] = await this.db
            .select()
            .from(website_builder_schema_1.wbGlobalTemplateSections)
            .where((0, drizzle_orm_1.eq)(website_builder_schema_1.wbGlobalTemplateSections.id, id));
        return section || null;
    }
    async cloneGlobalSection(globalSectionId, pageId, tenantId) {
        const globalSection = await this.findOneGlobalSection(globalSectionId);
        if (!globalSection) {
            throw new common_1.NotFoundException('Global Section not found');
        }
        await this.findOnePage(pageId, tenantId);
        const existingSections = await this.findAllSections(tenantId, pageId);
        const newOrder = existingSections.length;
        const [newSection] = await this.db
            .insert(website_builder_schema_1.wbSections)
            .values({
            tenantId,
            pageId,
            name: globalSection.name,
            type: globalSection.type,
            order: newOrder,
            isActive: true,
            content: globalSection.content || {},
            styling: globalSection.styling || null,
        })
            .returning();
        return newSection;
    }
    async createDefaultTemplate(tenantId, tenantName, packageType) {
        const getPackageCategory = (pkg) => {
            if (pkg.startsWith('website_'))
                return 'website';
            if (pkg.startsWith('blog_'))
                return 'blog';
            if (pkg.startsWith('business_'))
                return 'business';
            if (pkg.startsWith('shop_'))
                return 'shop';
            if (pkg.startsWith('members_'))
                return 'members';
            if (pkg.startsWith('restaurant_'))
                return 'restaurant';
            if (pkg.startsWith('local_'))
                return 'local';
            if (pkg.startsWith('funnels_'))
                return 'funnels';
            if (['starter', 'landing', 'page', 'website_micro'].includes(pkg))
                return 'website';
            if (['creator', 'business_starter'].includes(pkg))
                return 'business';
            if (['shop', 'shop_mini'].includes(pkg))
                return 'shop';
            if (['professional', 'enterprise'].includes(pkg))
                return 'business';
            return 'website';
        };
        const category = getPackageCategory(packageType);
        const pageConfigs = [];
        if (category === 'website') {
            pageConfigs.push({
                name: 'Startseite',
                slug: 'home',
                isHomepage: true,
                order: 0,
                sections: [
                    {
                        name: 'Hero',
                        preset: preset_library_1.PRESETS.hero({
                            heading: `Willkommen bei ${tenantName}`,
                            subheading: 'Ihr professioneller Webauftritt — modern, schnell und DSGVO-konform.',
                            buttonText: 'Mehr erfahren',
                            buttonLink: '#kontakt',
                        }),
                    },
                    {
                        name: 'Features',
                        preset: preset_library_1.PRESETS.features({
                            heading: 'Warum wir?',
                            subheading: 'Das zeichnet uns aus',
                            items: [
                                {
                                    icon: '⭐',
                                    title: 'Qualität',
                                    description: 'Höchste Standards bei allem was wir tun.',
                                },
                                {
                                    icon: '🏆',
                                    title: 'Erfahrung',
                                    description: 'Jahrelange Expertise in unserem Bereich.',
                                },
                                {
                                    icon: '💬',
                                    title: 'Service',
                                    description: 'Persönliche Betreuung und schnelle Reaktion.',
                                },
                            ],
                        }),
                    },
                ],
            });
            if ([
                'website_standard',
                'website_pro',
                'website_mini',
                'website_wachstum',
            ].includes(packageType)) {
                pageConfigs.push({
                    name: 'Über uns',
                    slug: 'ueber-uns',
                    isHomepage: false,
                    order: 1,
                    sections: [
                        {
                            name: 'Über uns',
                            preset: preset_library_1.PRESETS.about({
                                heading: `Über ${tenantName}`,
                                description: 'Hier erzählen wir unsere Geschichte und was uns antreibt.',
                            }),
                        },
                    ],
                }, {
                    name: 'Kontakt',
                    slug: 'kontakt',
                    isHomepage: false,
                    order: 2,
                    sections: [
                        {
                            name: 'Kontakt',
                            preset: preset_library_1.PRESETS.contact({
                                heading: 'Kontakt aufnehmen',
                                subheading: 'Wir freuen uns von Ihnen zu hören.',
                            }),
                        },
                    ],
                });
            }
        }
        else if (category === 'blog') {
            pageConfigs.push({
                name: 'Startseite',
                slug: 'home',
                isHomepage: true,
                order: 0,
                sections: [
                    {
                        name: 'Hero',
                        preset: preset_library_1.PRESETS.hero({
                            heading: tenantName,
                            subheading: 'Aktuelle Beiträge, Insights und mehr.',
                            buttonText: 'Zum Blog',
                            buttonLink: '/blog',
                        }),
                    },
                    {
                        name: 'Blog Feed',
                        preset: preset_library_1.PRESETS.blogFeed({
                            heading: 'Neueste Beiträge',
                            count: 6,
                        }),
                    },
                ],
            }, {
                name: 'Über mich',
                slug: 'ueber-mich',
                isHomepage: false,
                order: 1,
                sections: [
                    {
                        name: 'Über mich',
                        preset: preset_library_1.PRESETS.about({
                            heading: `Hallo, ich bin ${tenantName}`,
                            description: 'Hier erzählst du etwas über dich und dein Blog-Thema.',
                        }),
                    },
                ],
            }, {
                name: 'Kontakt',
                slug: 'kontakt',
                isHomepage: false,
                order: 2,
                sections: [
                    {
                        name: 'Kontakt',
                        preset: preset_library_1.PRESETS.contact({
                            heading: 'Schreib mir',
                            subheading: 'Fragen, Kooperationen oder einfach Hallo.',
                        }),
                    },
                ],
            });
        }
        else if (category === 'business') {
            pageConfigs.push({
                name: 'Startseite',
                slug: 'home',
                isHomepage: true,
                order: 0,
                sections: [
                    {
                        name: 'Hero',
                        preset: preset_library_1.PRESETS.hero({
                            heading: tenantName,
                            subheading: 'Professionelle Dienstleistungen — Termine online buchen.',
                            buttonText: 'Termin buchen',
                            buttonLink: '/booking',
                        }),
                    },
                    {
                        name: 'Leistungen',
                        preset: preset_library_1.PRESETS.features({
                            heading: 'Unsere Leistungen',
                            subheading: 'Was wir für Sie tun können',
                            items: [
                                {
                                    icon: '✅',
                                    title: 'Leistung 1',
                                    description: 'Beschreibung Ihrer ersten Dienstleistung.',
                                },
                                {
                                    icon: '🎯',
                                    title: 'Leistung 2',
                                    description: 'Beschreibung Ihrer zweiten Dienstleistung.',
                                },
                                {
                                    icon: '⚡',
                                    title: 'Leistung 3',
                                    description: 'Beschreibung Ihrer dritten Dienstleistung.',
                                },
                            ],
                        }),
                    },
                    {
                        name: 'Booking CTA',
                        preset: preset_library_1.PRESETS.cta({
                            heading: 'Bereit für einen Termin?',
                            subheading: 'Einfach online buchen — in weniger als 2 Minuten.',
                            buttonText: 'Jetzt buchen',
                            buttonLink: '/booking',
                        }),
                    },
                ],
            }, {
                name: 'Über uns',
                slug: 'ueber-uns',
                isHomepage: false,
                order: 1,
                sections: [
                    {
                        name: 'Über uns',
                        preset: preset_library_1.PRESETS.about({
                            heading: `Über ${tenantName}`,
                            description: 'Unser Team und unsere Geschichte.',
                        }),
                    },
                ],
            }, {
                name: 'Kontakt',
                slug: 'kontakt',
                isHomepage: false,
                order: 2,
                sections: [
                    {
                        name: 'Kontakt',
                        preset: preset_library_1.PRESETS.contact({
                            heading: 'Kontakt aufnehmen',
                            subheading: 'Wir antworten innerhalb von 24 Stunden.',
                        }),
                    },
                ],
            });
        }
        else if (category === 'shop') {
            pageConfigs.push({
                name: 'Startseite',
                slug: 'home',
                isHomepage: true,
                order: 0,
                sections: [
                    {
                        name: 'Hero',
                        preset: preset_library_1.PRESETS.hero({
                            heading: `Willkommen im ${tenantName} Shop`,
                            subheading: 'Entdecke unsere Produkte — sicher & bequem bestellen.',
                            buttonText: 'Jetzt shoppen',
                            buttonLink: '/shop',
                        }),
                    },
                    {
                        name: 'Produkte',
                        preset: preset_library_1.PRESETS.features({
                            heading: 'Unsere Bestseller',
                            subheading: 'Die beliebtesten Produkte',
                            items: [
                                {
                                    icon: '📦',
                                    title: 'Produkt 1',
                                    description: 'Kurze Produktbeschreibung.',
                                },
                                {
                                    icon: '🎁',
                                    title: 'Produkt 2',
                                    description: 'Kurze Produktbeschreibung.',
                                },
                                {
                                    icon: '⭐',
                                    title: 'Produkt 3',
                                    description: 'Kurze Produktbeschreibung.',
                                },
                            ],
                        }),
                    },
                    {
                        name: 'Shop CTA',
                        preset: preset_library_1.PRESETS.cta({
                            heading: 'Alle Produkte entdecken',
                            subheading: 'Versandkostenfrei ab 50€ · Sichere Zahlung · 30 Tage Rückgabe',
                            buttonText: 'Zum Shop',
                            buttonLink: '/shop',
                        }),
                    },
                ],
            }, {
                name: 'Über uns',
                slug: 'ueber-uns',
                isHomepage: false,
                order: 1,
                sections: [
                    {
                        name: 'Über uns',
                        preset: preset_library_1.PRESETS.about({
                            heading: `Über ${tenantName}`,
                            description: 'Unser Unternehmen und unsere Geschichte.',
                        }),
                    },
                ],
            }, {
                name: 'Kontakt',
                slug: 'kontakt',
                isHomepage: false,
                order: 2,
                sections: [
                    {
                        name: 'Kontakt',
                        preset: preset_library_1.PRESETS.contact({
                            heading: 'Kontakt & Support',
                            subheading: 'Bei Fragen zu Ihrer Bestellung helfen wir gern.',
                        }),
                    },
                ],
            });
        }
        else if (category === 'members') {
            pageConfigs.push({
                name: 'Startseite',
                slug: 'home',
                isHomepage: true,
                order: 0,
                sections: [
                    {
                        name: 'Hero',
                        preset: preset_library_1.PRESETS.hero({
                            heading: `Willkommen bei ${tenantName}`,
                            subheading: 'Exklusive Inhalte, Community und Kurse — alles an einem Ort.',
                            buttonText: 'Mitglied werden',
                            buttonLink: '#mitgliedschaft',
                        }),
                    },
                    {
                        name: 'Features',
                        preset: preset_library_1.PRESETS.features({
                            heading: 'Was du bekommst',
                            subheading: 'Deine Mitgliedschaft beinhaltet',
                            items: [
                                {
                                    icon: '🔐',
                                    title: 'Exklusive Inhalte',
                                    description: 'Zugang zu allen Kursen und Materialien.',
                                },
                                {
                                    icon: '👥',
                                    title: 'Community',
                                    description: 'Vernetze dich mit Gleichgesinnten.',
                                },
                                {
                                    icon: '🎥',
                                    title: 'Live-Sessions',
                                    description: 'Regelmäßige Q&A und Workshops.',
                                },
                            ],
                        }),
                    },
                    {
                        name: 'CTA',
                        preset: preset_library_1.PRESETS.cta({
                            heading: 'Bereit einzusteigen?',
                            subheading: 'Wähle dein Mitgliedschaftsmodell und starte heute.',
                            buttonText: 'Jetzt Mitglied werden',
                            buttonLink: '#mitgliedschaft',
                        }),
                    },
                ],
            }, {
                name: 'Über uns',
                slug: 'ueber-uns',
                isHomepage: false,
                order: 1,
                sections: [
                    {
                        name: 'Über uns',
                        preset: preset_library_1.PRESETS.about({
                            heading: `Über ${tenantName}`,
                            description: 'Unsere Mission und was uns antreibt.',
                        }),
                    },
                ],
            }, {
                name: 'Kontakt',
                slug: 'kontakt',
                isHomepage: false,
                order: 2,
                sections: [
                    {
                        name: 'Kontakt',
                        preset: preset_library_1.PRESETS.contact({
                            heading: 'Fragen zur Mitgliedschaft?',
                            subheading: 'Wir helfen dir gern weiter.',
                        }),
                    },
                ],
            });
        }
        else if (category === 'restaurant') {
            pageConfigs.push({
                name: 'Startseite',
                slug: 'home',
                isHomepage: true,
                order: 0,
                sections: [
                    {
                        name: 'Hero',
                        preset: preset_library_1.PRESETS.hero({
                            heading: `Willkommen bei ${tenantName}`,
                            subheading: 'Frische Küche, einfach bestellen — Tisch reservieren oder direkt online bestellen.',
                            buttonText: 'Jetzt bestellen',
                            buttonLink: '/bestellen',
                        }),
                    },
                    {
                        name: 'Speisekarte',
                        preset: preset_library_1.PRESETS.features({
                            heading: 'Unsere Speisekarte',
                            subheading: 'Frische Zutaten, ehrliche Küche',
                            items: [
                                {
                                    icon: '🥗',
                                    title: 'Vorspeisen',
                                    description: 'Leichte Starters für den perfekten Einstieg.',
                                },
                                {
                                    icon: '🍽️',
                                    title: 'Hauptgerichte',
                                    description: 'Sorgfältig zubereitete Hauptspeisen.',
                                },
                                {
                                    icon: '🍰',
                                    title: 'Desserts',
                                    description: 'Süße Abschlüsse für jeden Geschmack.',
                                },
                            ],
                        }),
                    },
                    {
                        name: 'Reservierung CTA',
                        preset: preset_library_1.PRESETS.cta({
                            heading: 'Tisch reservieren',
                            subheading: 'Online buchen — schnell, einfach, verbindlich.',
                            buttonText: 'Jetzt reservieren',
                            buttonLink: '/reservierung',
                        }),
                    },
                ],
            }, {
                name: 'Über uns',
                slug: 'ueber-uns',
                isHomepage: false,
                order: 1,
                sections: [
                    {
                        name: 'Über uns',
                        preset: preset_library_1.PRESETS.about({
                            heading: `Über ${tenantName}`,
                            description: 'Unsere Geschichte, unsere Küche, unser Team.',
                        }),
                    },
                ],
            }, {
                name: 'Kontakt',
                slug: 'kontakt',
                isHomepage: false,
                order: 2,
                sections: [
                    {
                        name: 'Kontakt',
                        preset: preset_library_1.PRESETS.contact({
                            heading: 'Kontakt & Öffnungszeiten',
                            subheading: 'Wir freuen uns auf Ihren Besuch.',
                        }),
                    },
                ],
            });
        }
        else if (category === 'local') {
            pageConfigs.push({
                name: 'Startseite',
                slug: 'home',
                isHomepage: true,
                order: 0,
                sections: [
                    {
                        name: 'Hero',
                        preset: preset_library_1.PRESETS.hero({
                            heading: `${tenantName} — jetzt online bestellen`,
                            subheading: 'Bequem vorbestellen, Wunschtermin wählen und abholen — ohne Warteschlange.',
                            buttonText: 'Jetzt vorbestellen',
                            buttonLink: '/bestellen',
                        }),
                    },
                    {
                        name: 'Sortiment',
                        preset: preset_library_1.PRESETS.features({
                            heading: 'Unser Sortiment',
                            subheading: 'Regional, frisch, für Sie',
                            items: [
                                {
                                    icon: '🛒',
                                    title: 'Kategorie 1',
                                    description: 'Beschreibung Ihrer ersten Produktkategorie.',
                                },
                                {
                                    icon: '📦',
                                    title: 'Kategorie 2',
                                    description: 'Beschreibung Ihrer zweiten Produktkategorie.',
                                },
                                {
                                    icon: '⭐',
                                    title: 'Kategorie 3',
                                    description: 'Beschreibung Ihrer dritten Produktkategorie.',
                                },
                            ],
                        }),
                    },
                    {
                        name: 'Click & Collect CTA',
                        preset: preset_library_1.PRESETS.cta({
                            heading: "Click & Collect — so einfach geht's",
                            subheading: 'Online bestellen → Abholtermin wählen → fertig. Kein Warten, keine Schlange.',
                            buttonText: 'Abholtermin buchen',
                            buttonLink: '/bestellen',
                        }),
                    },
                ],
            }, {
                name: 'Über uns',
                slug: 'ueber-uns',
                isHomepage: false,
                order: 1,
                sections: [
                    {
                        name: 'Über uns',
                        preset: preset_library_1.PRESETS.about({
                            heading: `Über ${tenantName}`,
                            description: 'Unser Geschäft, unsere Geschichte, unsere Werte.',
                        }),
                    },
                ],
            }, {
                name: 'Kontakt',
                slug: 'kontakt',
                isHomepage: false,
                order: 2,
                sections: [
                    {
                        name: 'Kontakt',
                        preset: preset_library_1.PRESETS.contact({
                            heading: 'Kontakt & Öffnungszeiten',
                            subheading: 'Wir sind für Sie da.',
                        }),
                    },
                ],
            });
        }
        else if (category === 'funnels') {
            pageConfigs.push({
                name: 'Startseite',
                slug: 'home',
                isHomepage: true,
                order: 0,
                sections: [
                    {
                        name: 'Hero',
                        preset: preset_library_1.PRESETS.hero({
                            heading: tenantName,
                            subheading: 'Generiere qualifizierte Leads und wandle Besucher in Kunden um.',
                            buttonText: 'Jetzt kostenlos starten',
                            buttonLink: '#optin',
                        }),
                    },
                    {
                        name: 'Benefits',
                        preset: preset_library_1.PRESETS.features({
                            heading: 'Was du bekommst',
                            subheading: 'Alles was du für mehr Conversions brauchst',
                            items: [
                                {
                                    icon: '🎯',
                                    title: 'Mehr Leads',
                                    description: 'Optimierte Opt-in Seiten die konvertieren.',
                                },
                                {
                                    icon: '⚡',
                                    title: 'Automatisierung',
                                    description: 'Follow-up Sequenzen die automatisch laufen.',
                                },
                                {
                                    icon: '📊',
                                    title: 'Analytics',
                                    description: 'Verstehe wo deine Leads herkommen.',
                                },
                            ],
                        }),
                    },
                    {
                        name: 'Opt-in CTA',
                        preset: preset_library_1.PRESETS.cta({
                            heading: 'Bereit für mehr Kunden?',
                            subheading: 'Starte jetzt und sieh wie dein Business wächst.',
                            buttonText: 'Kostenlos testen',
                            buttonLink: '#optin',
                        }),
                    },
                ],
            }, {
                name: 'Über uns',
                slug: 'ueber-uns',
                isHomepage: false,
                order: 1,
                sections: [
                    {
                        name: 'Über uns',
                        preset: preset_library_1.PRESETS.about({
                            heading: `Über ${tenantName}`,
                            description: 'Wer wir sind und warum wir dir helfen können.',
                        }),
                    },
                ],
            }, {
                name: 'Kontakt',
                slug: 'kontakt',
                isHomepage: false,
                order: 2,
                sections: [
                    {
                        name: 'Kontakt',
                        preset: preset_library_1.PRESETS.contact({
                            heading: 'Kontakt aufnehmen',
                            subheading: 'Fragen? Wir antworten innerhalb von 24 Stunden.',
                        }),
                    },
                ],
            });
        }
        pageConfigs.push({
            name: 'Impressum',
            slug: 'impressum',
            isHomepage: false,
            order: 100,
            sections: [{ name: 'Impressum', preset: (0, preset_library_1.impressumPreset)(tenantName) }],
        }, {
            name: 'Datenschutz',
            slug: 'datenschutz',
            isHomepage: false,
            order: 101,
            sections: [
                { name: 'Datenschutz', preset: (0, preset_library_1.datenschutzPreset)(tenantName) },
            ],
        });
        const templateName = category === 'website'
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
            .insert(website_builder_schema_1.wbTemplates)
            .values({
            tenantId,
            name: templateName,
            description: `Standard-Template für ${packageType}`,
            isActive: true,
            isDefault: true,
            settings: {},
        })
            .returning();
        for (const pageConfig of pageConfigs) {
            const [page] = await this.db
                .insert(website_builder_schema_1.wbPages)
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
                await this.db.insert(website_builder_schema_1.wbSections).values({
                    tenantId,
                    pageId: page.id,
                    name: s.name,
                    type: s.preset.type,
                    order: i,
                    isActive: true,
                    content: s.preset.content,
                    styling: s.preset.styling || null,
                });
            }
        }
        return template;
    }
};
exports.WebsiteBuilderService = WebsiteBuilderService;
exports.WebsiteBuilderService = WebsiteBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], WebsiteBuilderService);
//# sourceMappingURL=website-builder.service.js.map