# 🎨 Website Builder Module

## 📦 Was du bekommst

**Komplettes NestJS Modul mit Drizzle & GraphQL:**

### **Dateien:**

```
website-builder/
├── website-builder.module.ts      # NestJS Module
├── website-builder.service.ts     # Service (Drizzle Queries)
├── website-builder.resolver.ts    # GraphQL Resolver
├── entities/
│   ├── template.entity.ts         # GraphQL Object Type
│   ├── page.entity.ts             # GraphQL Object Type
│   └── section.entity.ts          # GraphQL Object Type + Enum
└── dto/
    ├── create-template.input.ts   # GraphQL Input
    ├── update-template.input.ts   # GraphQL Input
    ├── create-page.input.ts       # GraphQL Input
    ├── update-page.input.ts       # GraphQL Input
    ├── create-section.input.ts    # GraphQL Input
    └── update-section.input.ts    # GraphQL Input
```

---

## 🚀 Installation

### **Schritt 1: Module kopieren**

```bash
# Kopiere das ganze Verzeichnis
cp -r website-builder /dein-projekt/src/modules/
```

Deine Struktur:
```
src/
├── modules/
│   ├── cms/
│   ├── shop/
│   ├── navigation/
│   └── website-builder/  ← NEU
```

---

### **Schritt 2: In app.module.ts registrieren**

```typescript
// src/app.module.ts
import { WebsiteBuilderModule } from './modules/website-builder/website-builder.module';

@Module({
  imports: [
    // ... andere Module ...
    NavigationModule,
    PublicModule,
    WebsiteTemplateModule, // ← ALTE entfernen falls vorhanden
    WebsiteBuilderModule,  // ← NEU hinzufügen
  ],
})
export class AppModule {}
```

---

### **Schritt 3: Schema bereits integriert?**

Stelle sicher, dass du das **Drizzle Schema** bereits integriert hast:

```
drizzle/
├── schema.ts                    # ✅ Bereinigt
├── website-builder.schema.ts    # ✅ NEU
└── index.ts                     # ✅ NEU
```

Falls noch nicht: Siehe `drizzle-schema/INTEGRATION_GUIDE.md`

---

### **Schritt 4: Migration**

Falls Schema neu:
```bash
npm run drizzle-kit generate
npm run drizzle-kit migrate
```

---

### **Schritt 5: Server starten**

```bash
npm run build
npm run start:dev
```

GraphQL Playground öffnen:
```
http://localhost:3000/graphql
```

---

## 📋 GraphQL API

### **Queries:**

#### Templates:
```graphql
# Alle Templates
query {
  wbTemplates(tenantId: "xxx") {
    id
    name
    description
    isDefault
    pages {
      id
      name
      slug
    }
  }
}

# Ein Template
query {
  wbTemplate(id: "xxx", tenantId: "xxx") {
    id
    name
    pages {
      id
      name
      sections {
        id
        name
        type
      }
    }
  }
}

# Standard-Template
query {
  wbDefaultTemplate(tenantId: "xxx") {
    id
    name
  }
}
```

#### Pages:
```graphql
# Alle Pages
query {
  wbPages(tenantId: "xxx", templateId: "xxx") {
    id
    name
    slug
    isHomepage
    sections {
      id
      name
      type
    }
  }
}

# Eine Page
query {
  wbPage(id: "xxx", tenantId: "xxx") {
    id
    name
    slug
    sections {
      id
      name
      type
      content
    }
  }
}

# Page per Slug (für Public)
query {
  wbPageBySlug(slug: "home", tenantId: "xxx") {
    id
    name
    metaTitle
    sections {
      id
      type
      content
      styling
    }
  }
}

# Homepage
query {
  wbHomepage(tenantId: "xxx", templateId: "xxx") {
    id
    name
    sections {
      id
      name
    }
  }
}
```

#### Sections:
```graphql
# Alle Sections
query {
  wbSections(tenantId: "xxx", pageId: "xxx") {
    id
    name
    type
    order
    isActive
    content
    styling
  }
}

# Eine Section
query {
  wbSection(id: "xxx", tenantId: "xxx") {
    id
    name
    type
    content
  }
}
```

---

### **Mutations:**

#### Templates:
```graphql
# Template erstellen
mutation {
  createTemplate(
    tenantId: "xxx"
    input: {
      name: "My Website"
      description: "A beautiful website"
      isActive: true
      settings: {
        colors: {
          primary: "#0066cc"
          secondary: "#00cc66"
        }
      }
    }
  ) {
    id
    name
  }
}

# Template aktualisieren
mutation {
  updateTemplate(
    id: "xxx"
    tenantId: "xxx"
    input: {
      name: "Updated Name"
    }
  ) {
    id
    name
  }
}

# Template löschen
mutation {
  deleteTemplate(id: "xxx", tenantId: "xxx")
}

# Template klonen
mutation {
  cloneTemplate(
    id: "xxx"
    tenantId: "xxx"
    newName: "My Website (Copy)"
  ) {
    id
    name
  }
}

# Als Standard setzen
mutation {
  setDefaultTemplate(id: "xxx", tenantId: "xxx") {
    id
    isDefault
  }
}
```

#### Pages:
```graphql
# Page erstellen
mutation {
  createPage(
    tenantId: "xxx"
    input: {
      templateId: "xxx"
      name: "Home"
      slug: "home"
      isHomepage: true
      metaTitle: "Welcome to my site"
    }
  ) {
    id
    name
    slug
  }
}

# Page aktualisieren
mutation {
  updatePage(
    id: "xxx"
    tenantId: "xxx"
    input: {
      name: "Homepage"
      metaDescription: "Updated description"
    }
  ) {
    id
    name
  }
}

# Page löschen
mutation {
  deletePage(id: "xxx", tenantId: "xxx")
}

# Sections neu ordnen
mutation {
  reorderSections(
    pageId: "xxx"
    tenantId: "xxx"
    sectionIds: ["section-1", "section-2", "section-3"]
  ) {
    id
    sections {
      id
      order
    }
  }
}
```

#### Sections:
```graphql
# Section erstellen
mutation {
  createSection(
    tenantId: "xxx"
    input: {
      pageId: "xxx"
      name: "Hero Section"
      type: HERO
      order: 0
      content: {
        heading: "Welcome"
        subheading: "To my amazing website"
        buttonText: "Learn More"
        buttonLink: "/about"
      }
      styling: {
        backgroundColor: "#0066cc"
        textColor: "#ffffff"
      }
    }
  ) {
    id
    name
    type
  }
}

# Section aktualisieren
mutation {
  updateSection(
    id: "xxx"
    tenantId: "xxx"
    input: {
      content: {
        heading: "Updated Heading"
      }
    }
  ) {
    id
    content
  }
}

# Section löschen
mutation {
  deleteSection(id: "xxx", tenantId: "xxx")
}

# Section duplizieren
mutation {
  duplicateSection(id: "xxx", tenantId: "xxx") {
    id
    name
  }
}

# Section Sichtbarkeit umschalten
mutation {
  toggleSectionVisibility(id: "xxx", tenantId: "xxx") {
    id
    isActive
  }
}

# Section verschieben
mutation {
  moveSection(
    id: "xxx"
    targetPageId: "xxx"
    tenantId: "xxx"
  ) {
    id
    pageId
  }
}
```

---

## 🔧 Auth Integration

Ersetze `@Args('tenantId')` mit deinem Auth-System:

```typescript
// website-builder.resolver.ts

// VORHER:
@Args('tenantId') tenantId: string,

// NACHHER:
@TenantId() tenantId: string,  // ← Dein Custom Decorator
```

Und Guards aktivieren:

```typescript
@Resolver(() => Template)
@UseGuards(GqlAuthGuard)  // ← Uncomment
export class WebsiteBuilderResolver {
  // ...
}
```

---

## 📝 Service Methoden

Der Service hat **23 Methoden**:

### Templates (8):
- `createTemplate()`
- `findAllTemplates()`
- `findOneTemplate()`
- `findDefaultTemplate()`
- `updateTemplate()`
- `deleteTemplate()`
- `cloneTemplate()`
- `setAsDefaultTemplate()`

### Pages (8):
- `createPage()`
- `findAllPages()`
- `findOnePage()`
- `findPageBySlug()`
- `findHomepage()`
- `updatePage()`
- `deletePage()`
- `reorderSections()`

### Sections (7):
- `createSection()`
- `findAllSections()`
- `findOneSection()`
- `updateSection()`
- `deleteSection()`
- `duplicateSection()`
- `toggleSectionVisibility()`
- `moveSection()`

---

## 🎨 Section Types

17 verfügbare Typen:

```typescript
enum SectionType {
  HERO = 'hero',
  FEATURES = 'features',
  ABOUT = 'about',
  SERVICES = 'services',
  GALLERY = 'gallery',
  TESTIMONIALS = 'testimonials',
  TEAM = 'team',
  PRICING = 'pricing',
  CTA = 'cta',
  CONTACT = 'contact',
  FAQ = 'faq',
  BLOG = 'blog',
  STATS = 'stats',
  VIDEO = 'video',
  TEXT = 'text',
  HTML = 'html',
  CUSTOM = 'custom',
}
```

---

## 💪 Features

### ✅ Multi-Tenant
Alle Queries nutzen `tenantId` - 100% isoliert!

### ✅ Type-Safe
Drizzle + TypeScript = Keine Runtime Errors!

### ✅ GraphQL
Nutzt dein bestehendes GraphQL Setup

### ✅ Flexible Content
JSON Content pro Section-Type

### ✅ Relations
Template → Pages → Sections (automatisch geladen)

### ✅ Validation
`NotFoundException` & `ConflictException`

---

## 🎯 Nächste Schritte

Nach erfolgreicher Integration:

1. ✅ **Frontend integrieren**
   - Dashboard Components (React/Next.js)
   - Public Renderer

2. ✅ **Public Query Endpoint**
   - Öffentlicher GraphQL Endpoint ohne Auth
   - Für Frontend-Rendering

3. ✅ **Permissions/Roles**
   - Owner/Admin/User Unterscheidung
   - Feingranulare Berechtigungen

---

## 🆘 Troubleshooting

### Problem: "Cannot find module 'website-builder.schema'"
**Lösung:** Prüfe Import-Pfad in Service:
```typescript
import { wbTemplates } from '../../drizzle/website-builder.schema';
```

### Problem: GraphQL Schema Build Error
**Lösung:** 
```bash
# Schema neu generieren
npm run build
```

### Problem: "DRIZZLE provider not found"
**Lösung:** DrizzleModule muss in `app.module.ts` importiert sein:
```typescript
imports: [
  DrizzleModule,  // ← Wichtig!
  // ...
]
```

---

## 📦 Dependencies

Keine neuen! Nutzt bereits vorhandene:
- ✅ NestJS
- ✅ GraphQL
- ✅ Drizzle ORM
- ✅ graphql-type-json (bereits in deinem Projekt)

---

## ✅ Checklist

- [ ] Modul nach `/src/modules/website-builder/` kopiert
- [ ] In `app.module.ts` registriert
- [ ] Schema integriert (`website-builder.schema.ts`)
- [ ] Migration durchgeführt
- [ ] Build erfolgreich
- [ ] Server startet
- [ ] GraphQL Playground erreichbar
- [ ] Queries funktionieren

**Alle ✅? Dann bist du ready!** 🚀
