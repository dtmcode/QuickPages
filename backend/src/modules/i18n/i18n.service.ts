/**
 * ==================== I18N SERVICE ====================
 * Mehrsprachigkeit für Content + UI
 *
 * Content-Translations: Posts, Pages, Products etc. in verschiedenen Sprachen
 * UI-Translations: "In den Warenkorb", "Weiterlesen" etc.
 */

import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export const SUPPORTED_LOCALES = [
  'de',
  'en',
  'fr',
  'es',
  'it',
  'nl',
  'pl',
  'tr',
  'pt',
  'ru',
  'ar',
  'ja',
  'zh',
] as const;

// Default UI translations (German + English)
const DEFAULT_UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  de: {
    'common.home': 'Startseite',
    'common.contact': 'Kontakt',
    'common.about': 'Über uns',
    'common.search': 'Suchen',
    'common.back': 'Zurück',
    'common.loading': 'Wird geladen...',
    'common.read_more': 'Weiterlesen',
    'common.show_more': 'Mehr anzeigen',
    'common.free': 'Kostenlos',
    'shop.add_to_cart': 'In den Warenkorb',
    'shop.cart': 'Warenkorb',
    'shop.checkout': 'Zur Kasse',
    'shop.price': 'Preis',
    'shop.quantity': 'Menge',
    'shop.total': 'Gesamt',
    'shop.empty_cart': 'Warenkorb ist leer',
    'blog.posted_on': 'Veröffentlicht am',
    'blog.by': 'von',
    'blog.comments': 'Kommentare',
    'blog.no_posts': 'Keine Beiträge gefunden',
    'booking.book_now': 'Jetzt buchen',
    'booking.select_service': 'Service wählen',
    'booking.select_date': 'Datum wählen',
    'booking.select_time': 'Uhrzeit wählen',
    'newsletter.subscribe': 'Abonnieren',
    'newsletter.email_placeholder': 'Deine E-Mail-Adresse',
    'footer.privacy': 'Datenschutz',
    'footer.imprint': 'Impressum',
    'footer.terms': 'AGB',
    'restaurant.menu_empty': 'Speisekarte wird bald verfügbar sein',
    'restaurant.order_now': 'Jetzt bestellen',
    'contact.send': 'Senden',
    'contact.sending': 'Wird gesendet...',
    'contact.success': 'Nachricht gesendet!',
    'contact.error': 'Fehler beim Senden',
  },
  en: {
    'common.home': 'Home',
    'common.contact': 'Contact',
    'common.about': 'About',
    'common.search': 'Search',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.read_more': 'Read more',
    'common.show_more': 'Show more',
    'common.free': 'Free',
    'shop.add_to_cart': 'Add to cart',
    'shop.cart': 'Cart',
    'shop.checkout': 'Checkout',
    'shop.price': 'Price',
    'shop.quantity': 'Quantity',
    'shop.total': 'Total',
    'shop.empty_cart': 'Cart is empty',
    'blog.posted_on': 'Posted on',
    'blog.by': 'by',
    'blog.comments': 'Comments',
    'blog.no_posts': 'No posts found',
    'booking.book_now': 'Book now',
    'booking.select_service': 'Select service',
    'booking.select_date': 'Select date',
    'booking.select_time': 'Select time',
    'newsletter.subscribe': 'Subscribe',
    'newsletter.email_placeholder': 'Your email address',
    'footer.privacy': 'Privacy',
    'footer.imprint': 'Legal Notice',
    'footer.terms': 'Terms',
    'restaurant.menu_empty': 'Menu coming soon',
    'restaurant.order_now': 'Order now',
    'contact.send': 'Send',
    'contact.sending': 'Sending...',
    'contact.success': 'Message sent!',
    'contact.error': 'Error sending message',
  },
  fr: {
    'common.home': 'Accueil',
    'common.contact': 'Contact',
    'common.about': 'À propos',
    'common.search': 'Rechercher',
    'common.back': 'Retour',
    'common.loading': 'Chargement...',
    'common.read_more': 'Lire la suite',
    'common.show_more': 'Afficher plus',
    'common.free': 'Gratuit',
    'shop.add_to_cart': 'Ajouter au panier',
    'shop.cart': 'Panier',
    'shop.checkout': 'Commander',
    'shop.price': 'Prix',
    'shop.quantity': 'Quantité',
    'shop.total': 'Total',
    'shop.empty_cart': 'Panier vide',
    'blog.posted_on': 'Publié le',
    'blog.by': 'par',
    'blog.comments': 'Commentaires',
    'blog.no_posts': 'Aucun article trouvé',
    'booking.book_now': 'Réserver maintenant',
    'booking.select_service': 'Choisir un service',
    'booking.select_date': 'Choisir une date',
    'booking.select_time': 'Choisir une heure',
    'newsletter.subscribe': "S'abonner",
    'newsletter.email_placeholder': 'Votre adresse e-mail',
    'footer.privacy': 'Confidentialité',
    'footer.imprint': 'Mentions légales',
    'footer.terms': 'CGU',
    'restaurant.menu_empty': 'Menu bientôt disponible',
    'restaurant.order_now': 'Commander',
    'contact.send': 'Envoyer',
    'contact.sending': 'Envoi...',
    'contact.success': 'Message envoyé !',
    'contact.error': "Erreur d'envoi",
  },
  es: {
    'common.home': 'Inicio',
    'common.contact': 'Contacto',
    'common.about': 'Sobre nosotros',
    'common.search': 'Buscar',
    'common.back': 'Volver',
    'common.loading': 'Cargando...',
    'common.read_more': 'Leer más',
    'common.show_more': 'Mostrar más',
    'common.free': 'Gratis',
    'shop.add_to_cart': 'Añadir al carrito',
    'shop.cart': 'Carrito',
    'shop.checkout': 'Finalizar compra',
    'shop.price': 'Precio',
    'shop.quantity': 'Cantidad',
    'shop.total': 'Total',
    'shop.empty_cart': 'Carrito vacío',
    'blog.posted_on': 'Publicado el',
    'blog.by': 'por',
    'blog.comments': 'Comentarios',
    'blog.no_posts': 'No se encontraron artículos',
    'booking.book_now': 'Reservar ahora',
    'booking.select_service': 'Seleccionar servicio',
    'booking.select_date': 'Seleccionar fecha',
    'booking.select_time': 'Seleccionar hora',
    'newsletter.subscribe': 'Suscribirse',
    'newsletter.email_placeholder': 'Tu dirección de correo',
    'footer.privacy': 'Privacidad',
    'footer.imprint': 'Aviso legal',
    'footer.terms': 'Términos',
    'restaurant.menu_empty': 'Menú próximamente',
    'restaurant.order_now': 'Pedir ahora',
    'contact.send': 'Enviar',
    'contact.sending': 'Enviando...',
    'contact.success': '¡Mensaje enviado!',
    'contact.error': 'Error al enviar',
  },
  it: {
    'common.home': 'Home',
    'common.contact': 'Contatti',
    'common.about': 'Chi siamo',
    'common.search': 'Cerca',
    'common.back': 'Indietro',
    'common.loading': 'Caricamento...',
    'common.read_more': 'Leggi di più',
    'common.show_more': 'Mostra di più',
    'common.free': 'Gratuito',
    'shop.add_to_cart': 'Aggiungi al carrello',
    'shop.cart': 'Carrello',
    'shop.checkout': 'Acquista',
    'shop.price': 'Prezzo',
    'shop.quantity': 'Quantità',
    'shop.total': 'Totale',
    'shop.empty_cart': 'Carrello vuoto',
    'blog.posted_on': 'Pubblicato il',
    'blog.by': 'di',
    'blog.comments': 'Commenti',
    'blog.no_posts': 'Nessun articolo trovato',
    'booking.book_now': 'Prenota ora',
    'booking.select_service': 'Seleziona servizio',
    'booking.select_date': 'Seleziona data',
    'booking.select_time': 'Seleziona ora',
    'newsletter.subscribe': 'Iscriviti',
    'newsletter.email_placeholder': 'Il tuo indirizzo email',
    'footer.privacy': 'Privacy',
    'footer.imprint': 'Note legali',
    'footer.terms': 'Termini',
    'restaurant.menu_empty': 'Menu in arrivo',
    'restaurant.order_now': 'Ordina ora',
    'contact.send': 'Invia',
    'contact.sending': 'Invio...',
    'contact.success': 'Messaggio inviato!',
    'contact.error': "Errore nell'invio",
  },
  nl: {
    'common.home': 'Home',
    'common.contact': 'Contact',
    'common.about': 'Over ons',
    'common.search': 'Zoeken',
    'common.back': 'Terug',
    'common.loading': 'Laden...',
    'common.read_more': 'Lees meer',
    'common.show_more': 'Meer tonen',
    'common.free': 'Gratis',
    'shop.add_to_cart': 'In winkelwagen',
    'shop.cart': 'Winkelwagen',
    'shop.checkout': 'Afrekenen',
    'shop.price': 'Prijs',
    'shop.quantity': 'Aantal',
    'shop.total': 'Totaal',
    'shop.empty_cart': 'Winkelwagen is leeg',
    'blog.posted_on': 'Gepubliceerd op',
    'blog.by': 'door',
    'blog.comments': 'Reacties',
    'blog.no_posts': 'Geen berichten gevonden',
    'booking.book_now': 'Nu boeken',
    'booking.select_service': 'Selecteer service',
    'booking.select_date': 'Selecteer datum',
    'booking.select_time': 'Selecteer tijd',
    'newsletter.subscribe': 'Abonneren',
    'newsletter.email_placeholder': 'Uw e-mailadres',
    'footer.privacy': 'Privacy',
    'footer.imprint': 'Impressum',
    'footer.terms': 'Voorwaarden',
    'restaurant.menu_empty': 'Menu binnenkort beschikbaar',
    'restaurant.order_now': 'Nu bestellen',
    'contact.send': 'Versturen',
    'contact.sending': 'Versturen...',
    'contact.success': 'Bericht verzonden!',
    'contact.error': 'Fout bij verzenden',
  },
  pl: {
    'common.home': 'Strona główna',
    'common.contact': 'Kontakt',
    'common.about': 'O nas',
    'common.search': 'Szukaj',
    'common.back': 'Wróć',
    'common.loading': 'Ładowanie...',
    'common.read_more': 'Czytaj więcej',
    'common.show_more': 'Pokaż więcej',
    'common.free': 'Bezpłatnie',
    'shop.add_to_cart': 'Dodaj do koszyka',
    'shop.cart': 'Koszyk',
    'shop.checkout': 'Do kasy',
    'shop.price': 'Cena',
    'shop.quantity': 'Ilość',
    'shop.total': 'Łącznie',
    'shop.empty_cart': 'Koszyk jest pusty',
    'blog.posted_on': 'Opublikowano',
    'blog.by': 'przez',
    'blog.comments': 'Komentarze',
    'blog.no_posts': 'Nie znaleziono artykułów',
    'booking.book_now': 'Zarezerwuj teraz',
    'booking.select_service': 'Wybierz usługę',
    'booking.select_date': 'Wybierz datę',
    'booking.select_time': 'Wybierz godzinę',
    'newsletter.subscribe': 'Subskrybuj',
    'newsletter.email_placeholder': 'Twój adres e-mail',
    'footer.privacy': 'Prywatność',
    'footer.imprint': 'Impressum',
    'footer.terms': 'Regulamin',
    'restaurant.menu_empty': 'Menu wkrótce dostępne',
    'restaurant.order_now': 'Zamów teraz',
    'contact.send': 'Wyślij',
    'contact.sending': 'Wysyłanie...',
    'contact.success': 'Wiadomość wysłana!',
    'contact.error': 'Błąd wysyłania',
  },
  tr: {
    'common.home': 'Ana Sayfa',
    'common.contact': 'İletişim',
    'common.about': 'Hakkımızda',
    'common.search': 'Ara',
    'common.back': 'Geri',
    'common.loading': 'Yükleniyor...',
    'common.read_more': 'Devamını oku',
    'common.show_more': 'Daha fazla göster',
    'common.free': 'Ücretsiz',
    'shop.add_to_cart': 'Sepete ekle',
    'shop.cart': 'Sepet',
    'shop.checkout': 'Ödeme',
    'shop.price': 'Fiyat',
    'shop.quantity': 'Miktar',
    'shop.total': 'Toplam',
    'shop.empty_cart': 'Sepet boş',
    'blog.posted_on': 'Yayınlanma tarihi',
    'blog.by': 'tarafından',
    'blog.comments': 'Yorumlar',
    'blog.no_posts': 'Makale bulunamadı',
    'booking.book_now': 'Şimdi rezervasyon yap',
    'booking.select_service': 'Hizmet seç',
    'booking.select_date': 'Tarih seç',
    'booking.select_time': 'Saat seç',
    'newsletter.subscribe': 'Abone ol',
    'newsletter.email_placeholder': 'E-posta adresiniz',
    'footer.privacy': 'Gizlilik',
    'footer.imprint': 'Künye',
    'footer.terms': 'Şartlar',
    'restaurant.menu_empty': 'Menü yakında',
    'restaurant.order_now': 'Şimdi sipariş ver',
    'contact.send': 'Gönder',
    'contact.sending': 'Gönderiliyor...',
    'contact.success': 'Mesaj gönderildi!',
    'contact.error': 'Gönderme hatası',
  },
  pt: {
    'common.home': 'Início',
    'common.contact': 'Contato',
    'common.about': 'Sobre nós',
    'common.search': 'Pesquisar',
    'common.back': 'Voltar',
    'common.loading': 'Carregando...',
    'common.read_more': 'Leia mais',
    'common.show_more': 'Mostrar mais',
    'common.free': 'Grátis',
    'shop.add_to_cart': 'Adicionar ao carrinho',
    'shop.cart': 'Carrinho',
    'shop.checkout': 'Finalizar compra',
    'shop.price': 'Preço',
    'shop.quantity': 'Quantidade',
    'shop.total': 'Total',
    'shop.empty_cart': 'Carrinho vazio',
    'blog.posted_on': 'Publicado em',
    'blog.by': 'por',
    'blog.comments': 'Comentários',
    'blog.no_posts': 'Nenhum artigo encontrado',
    'booking.book_now': 'Reservar agora',
    'booking.select_service': 'Selecionar serviço',
    'booking.select_date': 'Selecionar data',
    'booking.select_time': 'Selecionar hora',
    'newsletter.subscribe': 'Assinar',
    'newsletter.email_placeholder': 'Seu endereço de e-mail',
    'footer.privacy': 'Privacidade',
    'footer.imprint': 'Impressum',
    'footer.terms': 'Termos',
    'restaurant.menu_empty': 'Cardápio em breve',
    'restaurant.order_now': 'Pedir agora',
    'contact.send': 'Enviar',
    'contact.sending': 'Enviando...',
    'contact.success': 'Mensagem enviada!',
    'contact.error': 'Erro ao enviar',
  },
  ru: {
    'common.home': 'Главная',
    'common.contact': 'Контакты',
    'common.about': 'О нас',
    'common.search': 'Поиск',
    'common.back': 'Назад',
    'common.loading': 'Загрузка...',
    'common.read_more': 'Читать далее',
    'common.show_more': 'Показать больше',
    'common.free': 'Бесплатно',
    'shop.add_to_cart': 'В корзину',
    'shop.cart': 'Корзина',
    'shop.checkout': 'Оформить заказ',
    'shop.price': 'Цена',
    'shop.quantity': 'Количество',
    'shop.total': 'Итого',
    'shop.empty_cart': 'Корзина пуста',
    'blog.posted_on': 'Опубликовано',
    'blog.by': 'автор',
    'blog.comments': 'Комментарии',
    'blog.no_posts': 'Статьи не найдены',
    'booking.book_now': 'Забронировать',
    'booking.select_service': 'Выбрать услугу',
    'booking.select_date': 'Выбрать дату',
    'booking.select_time': 'Выбрать время',
    'newsletter.subscribe': 'Подписаться',
    'newsletter.email_placeholder': 'Ваш адрес электронной почты',
    'footer.privacy': 'Конфиденциальность',
    'footer.imprint': 'Impressum',
    'footer.terms': 'Условия',
    'restaurant.menu_empty': 'Меню скоро появится',
    'restaurant.order_now': 'Заказать сейчас',
    'contact.send': 'Отправить',
    'contact.sending': 'Отправка...',
    'contact.success': 'Сообщение отправлено!',
    'contact.error': 'Ошибка отправки',
  },
  ar: {
    'common.home': 'الرئيسية',
    'common.contact': 'اتصل بنا',
    'common.about': 'من نحن',
    'common.search': 'بحث',
    'common.back': 'رجوع',
    'common.loading': 'جار التحميل...',
    'common.read_more': 'اقرأ المزيد',
    'common.show_more': 'عرض المزيد',
    'common.free': 'مجاني',
    'shop.add_to_cart': 'أضف إلى السلة',
    'shop.cart': 'سلة التسوق',
    'shop.checkout': 'إتمام الشراء',
    'shop.price': 'السعر',
    'shop.quantity': 'الكمية',
    'shop.total': 'الإجمالي',
    'shop.empty_cart': 'السلة فارغة',
    'blog.posted_on': 'نُشر في',
    'blog.by': 'بقلم',
    'blog.comments': 'التعليقات',
    'blog.no_posts': 'لا توجد مقالات',
    'booking.book_now': 'احجز الآن',
    'booking.select_service': 'اختر الخدمة',
    'booking.select_date': 'اختر التاريخ',
    'booking.select_time': 'اختر الوقت',
    'newsletter.subscribe': 'اشترك',
    'newsletter.email_placeholder': 'بريدك الإلكتروني',
    'footer.privacy': 'الخصوصية',
    'footer.imprint': 'بيانات قانونية',
    'footer.terms': 'الشروط',
    'restaurant.menu_empty': 'القائمة قريباً',
    'restaurant.order_now': 'اطلب الآن',
    'contact.send': 'إرسال',
    'contact.sending': 'جار الإرسال...',
    'contact.success': 'تم إرسال الرسالة!',
    'contact.error': 'خطأ في الإرسال',
  },
  ja: {
    'common.home': 'ホーム',
    'common.contact': 'お問い合わせ',
    'common.about': '会社概要',
    'common.search': '検索',
    'common.back': '戻る',
    'common.loading': '読み込み中...',
    'common.read_more': '続きを読む',
    'common.show_more': 'もっと見る',
    'common.free': '無料',
    'shop.add_to_cart': 'カートに追加',
    'shop.cart': 'カート',
    'shop.checkout': '購入手続き',
    'shop.price': '価格',
    'shop.quantity': '数量',
    'shop.total': '合計',
    'shop.empty_cart': 'カートは空です',
    'blog.posted_on': '投稿日',
    'blog.by': '著者',
    'blog.comments': 'コメント',
    'blog.no_posts': '記事が見つかりません',
    'booking.book_now': '今すぐ予約',
    'booking.select_service': 'サービスを選択',
    'booking.select_date': '日付を選択',
    'booking.select_time': '時間を選択',
    'newsletter.subscribe': '購読する',
    'newsletter.email_placeholder': 'メールアドレス',
    'footer.privacy': 'プライバシー',
    'footer.imprint': '会社情報',
    'footer.terms': '利用規約',
    'restaurant.menu_empty': 'メニューは近日公開',
    'restaurant.order_now': '今すぐ注文',
    'contact.send': '送信',
    'contact.sending': '送信中...',
    'contact.success': 'メッセージを送信しました！',
    'contact.error': '送信エラー',
  },
  zh: {
    'common.home': '首页',
    'common.contact': '联系我们',
    'common.about': '关于我们',
    'common.search': '搜索',
    'common.back': '返回',
    'common.loading': '加载中...',
    'common.read_more': '阅读更多',
    'common.show_more': '显示更多',
    'common.free': '免费',
    'shop.add_to_cart': '加入购物车',
    'shop.cart': '购物车',
    'shop.checkout': '结账',
    'shop.price': '价格',
    'shop.quantity': '数量',
    'shop.total': '总计',
    'shop.empty_cart': '购物车为空',
    'blog.posted_on': '发布于',
    'blog.by': '作者',
    'blog.comments': '评论',
    'blog.no_posts': '未找到文章',
    'booking.book_now': '立即预订',
    'booking.select_service': '选择服务',
    'booking.select_date': '选择日期',
    'booking.select_time': '选择时间',
    'newsletter.subscribe': '订阅',
    'newsletter.email_placeholder': '您的电子邮件地址',
    'footer.privacy': '隐私政策',
    'footer.imprint': '法律声明',
    'footer.terms': '条款',
    'restaurant.menu_empty': '菜单即将推出',
    'restaurant.order_now': '立即订购',
    'contact.send': '发送',
    'contact.sending': '发送中...',
    'contact.success': '消息已发送！',
    'contact.error': '发送错误',
  },
};
@Injectable()
export class I18nService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ===== LOCALE SETTINGS =====
  async getLocaleSettings(tenantId: string) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    return {
      defaultLocale: (tenant as any).defaultLocale || 'de',
      enabledLocales: (tenant as any).enabledLocales || ['de'],
      supportedLocales: [...SUPPORTED_LOCALES],
    };
  }

  async updateLocaleSettings(
    tenantId: string,
    defaultLocale: string,
    enabledLocales: string[],
  ) {
    if (!SUPPORTED_LOCALES.includes(defaultLocale as any))
      throw new Error('Ungültige Sprache');
    if (!enabledLocales.includes(defaultLocale))
      enabledLocales.unshift(defaultLocale);

    await this.db
      .update(tenants)
      .set({
        defaultLocale,
        enabledLocales,
        updatedAt: new Date(),
      } as any)
      .where(eq(tenants.id, tenantId));
    return true;
  }

  // ===== CONTENT TRANSLATIONS =====
  async getTranslations(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale?: string,
  ) {
    let query = sql`SELECT * FROM translations WHERE tenant_id = ${tenantId} AND entity_type = ${entityType} AND entity_id = ${entityId}`;
    if (locale) query = sql`${query} AND locale = ${locale}`;
    query = sql`${query} ORDER BY field ASC`;
    const result = await this.db.execute(query);
    return (result as any).rows || [];
  }

  async setTranslation(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale: string,
    field: string,
    value: string,
  ) {
    await this.db.execute(
      sql`INSERT INTO translations (tenant_id, entity_type, entity_id, locale, field, value)
          VALUES (${tenantId}, ${entityType}, ${entityId}, ${locale}, ${field}, ${value})
          ON CONFLICT (tenant_id, entity_type, entity_id, locale, field)
          DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    );
    return true;
  }

  async setTranslationsBatch(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale: string,
    translations: Record<string, string>,
  ) {
    for (const [field, value] of Object.entries(translations)) {
      await this.setTranslation(
        tenantId,
        entityType,
        entityId,
        locale,
        field,
        value,
      );
    }
    return true;
  }

  async deleteTranslations(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale?: string,
  ) {
    if (locale) {
      await this.db.execute(
        sql`DELETE FROM translations WHERE tenant_id = ${tenantId} AND entity_type = ${entityType} AND entity_id = ${entityId} AND locale = ${locale}`,
      );
    } else {
      await this.db.execute(
        sql`DELETE FROM translations WHERE tenant_id = ${tenantId} AND entity_type = ${entityType} AND entity_id = ${entityId}`,
      );
    }
    return true;
  }

  /**
   * Gibt Content mit Übersetzungen zurück
   * Fallback: defaultLocale → Originalwert
   */
  async getTranslatedContent(
    tenantId: string,
    entityType: string,
    entityId: string,
    locale: string,
    originalFields: Record<string, string>,
  ) {
    const translations = await this.getTranslations(
      tenantId,
      entityType,
      entityId,
      locale,
    );
    const translated = { ...originalFields };
    for (const t of translations) {
      if (t.value) translated[t.field] = t.value;
    }
    return translated;
  }

  // ===== UI TRANSLATIONS =====
  async getUiTranslations(
    tenantId: string,
    locale: string,
  ): Promise<Record<string, string>> {
    // Defaults laden
    const defaults =
      DEFAULT_UI_TRANSLATIONS[locale] || DEFAULT_UI_TRANSLATIONS['en'] || {};

    // Custom Overrides laden
    const result = await this.db.execute(
      sql`SELECT key, value FROM ui_translations WHERE tenant_id = ${tenantId} AND locale = ${locale}`,
    );

    const custom: Record<string, string> = {};
    for (const row of (result as any).rows || []) custom[row.key] = row.value;

    return { ...defaults, ...custom };
  }

  async setUiTranslation(
    tenantId: string,
    locale: string,
    key: string,
    value: string,
  ) {
    await this.db.execute(
      sql`INSERT INTO ui_translations (tenant_id, locale, key, value) VALUES (${tenantId}, ${locale}, ${key}, ${value})
          ON CONFLICT (tenant_id, locale, key) DO UPDATE SET value = EXCLUDED.value`,
    );
    return true;
  }

  async getAllUiTranslations(
    tenantId: string,
  ): Promise<Record<string, Record<string, string>>> {
    const settings = await this.getLocaleSettings(tenantId);
    const result: Record<string, Record<string, string>> = {};
    for (const locale of settings.enabledLocales) {
      result[locale] = await this.getUiTranslations(tenantId, locale);
    }
    return result;
  }

  // ===== PUBLIC: All translations for a locale =====
  async getPublicTranslations(tenantSlug: string, locale: string) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenantSlug))
      .limit(1);
    if (!tenant) return { ui: {}, locale, defaultLocale: 'de' };

    const enabledLocales = (tenant as any).enabledLocales || ['de'];
    const effectiveLocale = enabledLocales.includes(locale)
      ? locale
      : (tenant as any).defaultLocale || 'de';

    return {
      ui: await this.getUiTranslations(tenant.id, effectiveLocale),
      locale: effectiveLocale,
      defaultLocale: (tenant as any).defaultLocale || 'de',
      enabledLocales,
    };
  }
  /**
   * ✅ NEU: Batch-Übersetzungen für Section-Content
   * Wird vom Public Controller aufgerufen:
   * GET /api/public/:tenant/i18n/sections?locale=en&ids=id1,id2
   *
   * Response: { [sectionId]: { heading: "...", text: "...", buttonText: "..." } }
   */
  async getPublicSectionTranslations(
    tenantSlug: string,
    locale: string,
    sectionIds: string[],
  ): Promise<Record<string, Record<string, string>>> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenantSlug))
      .limit(1);

    if (!tenant || !sectionIds.length) return {};

    // Prüfen ob Locale aktiviert ist
    const enabledLocales: string[] = (tenant as any).enabledLocales || ['de'];
    const defaultLocale: string = (tenant as any).defaultLocale || 'de';
    const effectiveLocale = enabledLocales.includes(locale)
      ? locale
      : defaultLocale;

    // Wenn Default-Locale → keine Übersetzungen nötig
    if (effectiveLocale === defaultLocale) return {};

    // Alle Section-Übersetzungen in einem Query laden
    const placeholders = sectionIds.map((_, i) => `$${i + 3}`).join(', ');
    const result = await this.db.execute(
      sql`SELECT entity_id, field, value
          FROM translations
          WHERE tenant_id = ${tenant.id}
          AND entity_type = 'section'
          AND locale = ${effectiveLocale}
          AND entity_id::text = ANY(ARRAY[${sql.raw(sectionIds.map((id) => `'${id}'`).join(','))}])`,
    );

    // Nach Section-ID gruppieren
    const grouped: Record<string, Record<string, string>> = {};
    for (const row of (result as any).rows || []) {
      if (!grouped[row.entity_id]) grouped[row.entity_id] = {};
      grouped[row.entity_id][row.field] = row.value;
    }
    return grouped;
  }
}
