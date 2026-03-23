import { NavigationService } from './navigation.service';
import { Navigation } from './entities/navigation.entity';
import { NavigationItem } from './entities/navigation-item.entity';
import { CreateNavigationInput } from './dto/create-navigation.input';
import { UpdateNavigationInput } from './dto/update-navigation.input';
import { CreateNavigationItemInput } from './dto/create-navigation-item.input';
import { UpdateNavigationItemInput } from './dto/update-navigation-item.input';
export declare class NavigationResolver {
    private readonly navigationService;
    constructor(navigationService: NavigationService);
    createNavigation(input: CreateNavigationInput, tenantId: string): Promise<Navigation>;
    navigations(tenantId: string): Promise<Navigation[]>;
    navigationByLocation(location: string, tenantId: string): Promise<Navigation | null>;
    navigation(id: string, tenantId: string): Promise<Navigation>;
    updateNavigation(id: string, input: UpdateNavigationInput, tenantId: string): Promise<Navigation>;
    deleteNavigation(id: string, tenantId: string): Promise<boolean>;
    createNavigationItem(navigationId: string, input: CreateNavigationItemInput, tenantId: string): Promise<NavigationItem>;
    navigationItems(navigationId: string, tenantId: string): Promise<NavigationItem[]>;
    updateNavigationItem(itemId: string, input: UpdateNavigationItemInput, tenantId: string): Promise<NavigationItem>;
    deleteNavigationItem(itemId: string, tenantId: string): Promise<boolean>;
    reorderNavigationItems(navigationId: string, itemOrders: ItemOrderInput[], tenantId: string): Promise<boolean>;
}
declare class ItemOrderInput {
    id: string;
    order: number;
}
export {};
