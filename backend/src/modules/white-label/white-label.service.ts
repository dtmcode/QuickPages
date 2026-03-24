// 📂 PFAD: backend/src/modules/white-label/white-label.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface BrandingSettings {
  platformName?: string;
  logoUrl?: string;
  logoInitial?: string;
  primaryColor?: string;
  hidePoweredBy?: boolean;
  faviconUrl?: string;
}

@Injectable()
export class WhiteLabelService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getSettings(tenantId: string): Promise<BrandingSettings> {
    const [tenant] = await this.db
      .select({ branding: tenants.branding })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    return (tenant?.branding as BrandingSettings) || {};
  }

  async updateSettings(
    tenantId: string,
    data: BrandingSettings,
  ): Promise<BrandingSettings> {
    const current = await this.getSettings(tenantId);
    const merged = { ...current, ...data };

    await this.db
      .update(tenants)
      .set({ branding: merged, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));

    return merged;
  }
}
