import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { PublicService } from './public.service';

interface TenantSettings {
  defaultTemplateId?: string;
  modules?: Record<string, boolean>;
  limits?: Record<string, number>;
  [key: string]: unknown;
}

interface CreateOrderBody {
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
}

interface CustomerRegisterBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface CustomerLoginBody {
  email: string;
  password: string;
}

interface NewsletterSubscribeBody {
  email: string;
  firstName?: string;
  lastName?: string;
}

interface ContactFormBody {
  name: string;
  email: string;
  message: string;
  phone?: string;
  subject?: string;
}

@Controller('api/public/:tenant')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('settings')
  async getTenantSettings(@Param('tenant') tenantSlug: string) {
    return await this.publicService.getTenantSettings(tenantSlug);
  }

  @Get('branding')
  async getBranding(@Param('tenant') tenantSlug: string) {
    return await this.publicService.getTenantBranding(tenantSlug);
  }

  @Get('pages')
  async getPages(@Param('tenant') tenantSlug: string) {
    return await this.publicService.getPublishedPages(tenantSlug);
  }

  @Get('pages/:slug')
  async getPage(
    @Param('tenant') tenantSlug: string,
    @Param('slug') pageSlug: string,
  ) {
    return await this.publicService.getPageBySlug(tenantSlug, pageSlug);
  }

  @Get('navigation/:location')
  async getNavigation(
    @Param('tenant') tenantSlug: string,
    @Param('location') location: string,
  ) {
    return await this.publicService.getNavigation(tenantSlug, location);
  }

  @Get('products')
  async getProducts(@Param('tenant') tenantSlug: string) {
    return await this.publicService.getProducts(tenantSlug);
  }

  @Get('products/:slug')
  async getProduct(
    @Param('tenant') tenantSlug: string,
    @Param('slug') productSlug: string,
  ) {
    return await this.publicService.getProductBySlug(tenantSlug, productSlug);
  }

  @Post('orders')
  async createOrder(
    @Param('tenant') tenantSlug: string,
    @Body() body: CreateOrderBody,
  ) {
    return await this.publicService.createPublicOrder(tenantSlug, body);
  }

  @Get('posts')
  async getPosts(@Param('tenant') tenantSlug: string) {
    return await this.publicService.getPublishedPosts(tenantSlug);
  }

  @Get('posts/:slug')
  async getPost(
    @Param('tenant') tenantSlug: string,
    @Param('slug') postSlug: string,
  ) {
    return await this.publicService.getPostBySlug(tenantSlug, postSlug);
  }

  @Get('categories')
  async getCategories(@Param('tenant') tenantSlug: string) {
    return await this.publicService.getCategories(tenantSlug);
  }
  @Get('forms')
  async getPublicForms(
    @Param('tenant') tenantSlug: string,
  ): Promise<unknown[]> {
    return (await this.publicService.getPublicForms(tenantSlug)) as unknown[];
  }

  @Get('booking/services')
  async getPublicBookingServices(
    @Param('tenant') tenantSlug: string,
  ): Promise<unknown[]> {
    return (await this.publicService.getPublicBookingServices(
      tenantSlug,
    )) as unknown[];
  }

  @Get('wb/homepage')
  async getWbHomepage(@Param('tenant') tenantSlug: string) {
    const templateId = await this.getDefaultTemplateId(tenantSlug);
    if (!templateId) throw new NotFoundException('No default template found');
    return await this.publicService.getWbHomepage(tenantSlug, templateId);
  }

  @Get('wb/pages')
  async getWbPages(@Param('tenant') tenantSlug: string) {
    const templateId = await this.getDefaultTemplateId(tenantSlug);
    if (!templateId) return [];
    return await this.publicService.getPublishedWbPages(tenantSlug, templateId);
  }

  @Get('wb/pages/:slug')
  async getWbPage(
    @Param('tenant') tenantSlug: string,
    @Param('slug') pageSlug: string,
  ) {
    const templateId = await this.getDefaultTemplateId(tenantSlug);
    if (!templateId) throw new NotFoundException('No default template found');
    return await this.publicService.getWbPageBySlug(
      tenantSlug,
      templateId,
      pageSlug,
    );
  }
  @Get('wb/template-settings')
  async getWbTemplateSettings(@Param('tenant') tenantSlug: string) {
    const templateId = await this.getDefaultTemplateId(tenantSlug);
    if (!templateId) return {};
    return await this.publicService.getWbTemplateSettings(
      tenantSlug,
      templateId,
    );
  }

  @Post('newsletter/subscribe')
  async subscribe(
    @Param('tenant') tenantSlug: string,
    @Body() body: NewsletterSubscribeBody,
  ) {
    return await this.publicService.subscribeToNewsletter(tenantSlug, body);
  }

  @Post('contact')
  async contact(
    @Param('tenant') tenantSlug: string,
    @Body() body: ContactFormBody,
  ) {
    return await this.publicService.submitContactForm(tenantSlug, body);
  }

  @Post('auth/register')
  async customerRegister(
    @Param('tenant') tenantSlug: string,
    @Body() body: CustomerRegisterBody,
  ) {
    return await this.publicService.customerRegister(tenantSlug, body);
  }

  @Post('auth/login')
  async customerLogin(
    @Param('tenant') tenantSlug: string,
    @Body() body: CustomerLoginBody,
  ) {
    return await this.publicService.customerLogin(tenantSlug, body);
  }

  @Get('account/orders')
  async getCustomerOrders(
    @Param('tenant') tenantSlug: string,
    @Headers('authorization') auth: string,
  ) {
    const token = auth?.replace('Bearer ', '');
    if (!token) throw new NotFoundException('Unauthorized');
    return await this.publicService.getCustomerOrders(tenantSlug, token);
  }

  private async getDefaultTemplateId(
    tenantSlug: string,
  ): Promise<string | null> {
    try {
      const tenant = await this.publicService.getTenantSettings(tenantSlug);
      const settings = tenant.settings as TenantSettings | null;
      if (settings?.defaultTemplateId) return settings.defaultTemplateId;
      return await this.publicService.getDefaultTemplateId(tenantSlug);
    } catch {
      return null;
    }
  }
  // ==================== RESTAURANT ====================

  @Get('restaurant/settings')
  async getRestaurantSettings(@Param('tenant') tenant: string) {
    return this.publicService.getRestaurantSettings(tenant);
  }

  @Get('restaurant/menu')
  async getRestaurantMenu(@Param('tenant') tenant: string) {
    return this.publicService.getRestaurantMenu(tenant);
  }

  @Post('restaurant/order')
  async createRestaurantOrder(
    @Param('tenant') tenant: string,
    @Body() body: Record<string, unknown>,
  ) {
    // direkt an RestaurantService weiterleiten (über injection oder sql)
    return { message: 'Order received' }; // Platzhalter — RestaurantService injecten
  }

  // ==================== LOCAL STORE ====================

  @Get('local-store/settings')
  async getLocalStoreSettings(@Param('tenant') tenant: string) {
    return this.publicService.getLocalStoreSettings(tenant);
  }

  @Get('local-store/products')
  async getLocalStoreProducts(@Param('tenant') tenant: string) {
    return this.publicService.getLocalStoreProducts(tenant);
  }

  @Get('local-store/slots')
  async getLocalStoreSlots(@Param('tenant') tenant: string) {
    return this.publicService.getLocalStoreSlots(tenant);
  }

  // ==================== COURSES ====================

  @Get('courses')
  async getPublicCourses(@Param('tenant') tenant: string) {
    return this.publicService.getPublicCourses(tenant);
  }

  @Get('courses/:slug')
  async getPublicCourse(
    @Param('tenant') tenant: string,
    @Param('slug') slug: string,
  ) {
    return this.publicService.getPublicCourseBySlug(tenant, slug);
  }

  // ==================== MEMBERSHIP ====================

  @Get('membership/plans')
  async getMembershipPlans(@Param('tenant') tenant: string) {
    return this.publicService.getPublicMembershipPlans(tenant);
  }

  // ==================== FUNNELS ====================

  @Get('funnel/:slug')
  async getFunnel(
    @Param('tenant') tenant: string,
    @Param('slug') slug: string,
  ) {
    return this.publicService.getPublicFunnel(tenant, slug);
  }
}
