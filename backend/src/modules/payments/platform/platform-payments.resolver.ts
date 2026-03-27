import { Resolver, Query, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../../core/auth/decorators/tenant-id.decorator';

// ==================== TYPES ====================

@ObjectType()
class PlatformPaymentStatus {
  @Field()
  stripeConfigured: boolean;

  @Field()
  message: string;
}

// ==================== RESOLVER ====================
// 🚧 Vorbereitung — wird aktiviert wenn Stripe für SaaS-Abonnements eingerichtet ist
// Zuständig für: Pakete kaufen, Upgrades, Add-ons, Rechnungen

@Resolver()
export class PlatformPaymentsResolver {
  @Query(() => PlatformPaymentStatus)
  @UseGuards(GqlAuthGuard)
  async platformPaymentStatus(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @TenantId() _tenantId: string,
  ): Promise<PlatformPaymentStatus> {
    // TODO: Stripe Integration für SaaS-Abonnements
    // - createCheckoutSession(packageType)
    // - createPortalSession()
    // - handleWebhook(event)
    // - getInvoices()
    // - cancelSubscription()

    return {
      stripeConfigured: false,
      message:
        'Stripe-Integration für Paket-Abonnements ist in Vorbereitung. Pakete werden derzeit manuell aktiviert.',
    };
  }
}