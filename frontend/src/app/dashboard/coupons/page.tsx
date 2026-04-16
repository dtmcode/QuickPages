'use client';
// frontend\src\app\dashboard\coupons\page.tsx

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tag, Plus, Pencil, Trash2, Copy, CheckCircle,
  BarChart2, Loader2, RefreshCw,
} from 'lucide-react';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_COUPONS = gql`
  query { coupons { coupons {
    id code type value minOrderAmount maxUses usedCount
    isActive expiresAt applicableModule createdAt
  } total }}
`;

const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) { id code }
  }
`;

const UPDATE_COUPON = gql`
  mutation UpdateCoupon($id: ID!, $input: UpdateCouponInput!) {
    updateCoupon(id: $id, input: $input) { id isActive }
  }
`;

const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: ID!) { deleteCoupon(id: $id) }
`;

const GET_COUPON_USES = gql`
  query CouponUses($couponId: ID!) {
    couponUses(couponId: $couponId) { uses {
      id customerEmail referenceType discountAmount usedAt
    } total }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  applicableModule: string;
  createdAt: string;
}

interface CouponUse {
  id: string;
  customerEmail: string;
  referenceType: string;
  discountAmount: number;
  usedAt: string | null;
}

interface FormState {
  code: string;
  type: string;
  value: string;
  minOrderAmount: string;
  maxUses: string;
  expiresAt: string;
  applicableTo: string;
  isActive: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  percent:       { label: 'Prozent',       color: 'bg-blue-100 text-blue-800' },
  fixed:         { label: 'Festbetrag',    color: 'bg-green-100 text-green-800' },
  free_shipping: { label: 'Gratisversand', color: 'bg-purple-100 text-purple-800' },
};

const APPLICABLE_LABELS: Record<string, string> = {
  all:        '🌐 Alle Module',
  shop:       '🛒 Shop',
  restaurant: '🍽️ Restaurant',
  local:      '🏪 Lokaler Handel',
};

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ coupons }: { coupons: Coupon[] }) {
  const active    = coupons.filter(c => c.isActive && !isExpired(c.expiresAt)).length;
  const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);
  const expired   = coupons.filter(c => isExpired(c.expiresAt)).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Gutscheine gesamt', value: coupons.length, icon: Tag },
        { label: 'Aktiv',            value: active,          icon: CheckCircle },
        { label: 'Einlösungen',      value: totalUses,       icon: BarChart2 },
        { label: 'Abgelaufen',       value: expired,         icon: RefreshCw },
      ].map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Coupon Row ───────────────────────────────────────────────────────────────

function CouponRow({
  coupon, onEdit, onDelete, onToggle, onSelect,
}: {
  coupon: Coupon;
  onEdit: (c: Coupon) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onSelect: (c: Coupon) => void;
}) {
  const expired      = isExpired(coupon.expiresAt);
  const typeInfo     = TYPE_LABELS[coupon.type] ?? { label: coupon.type, color: 'bg-gray-100 text-gray-600' };
  const usagePercent = coupon.maxUses ? Math.round((coupon.usedCount / coupon.maxUses) * 100) : null;

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(coupon.code);
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg bg-card transition-opacity ${!coupon.isActive || expired ? 'opacity-60' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyCode}
            className="font-mono font-bold text-sm tracking-widest bg-muted px-2 py-0.5 rounded hover:bg-muted/80 flex items-center gap-1"
          >
            {coupon.code}
            <Copy className="h-3 w-3" />
          </button>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          <Badge variant="outline" className="text-xs">
            {APPLICABLE_LABELS[coupon.applicableModule] ?? coupon.applicableModule}
          </Badge>
          {expired && <Badge variant="destructive" className="text-xs">Abgelaufen</Badge>}
        </div>
        <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
          <span className="font-medium text-foreground">
            {coupon.type === 'percent'
              ? `${coupon.value}% Rabatt`
              : coupon.type === 'fixed'
              ? `${fmt(coupon.value)} Rabatt`
              : 'Gratisversand'}
          </span>
          {coupon.minOrderAmount && <span>ab {fmt(coupon.minOrderAmount)} MBW</span>}
          <span>
            {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''} Einlösungen
            {usagePercent !== null && ` (${usagePercent}%)`}
          </span>
          {coupon.expiresAt && (
            <span>bis {new Date(coupon.expiresAt).toLocaleDateString('de-DE')}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Switch
          checked={coupon.isActive && !expired}
          disabled={expired}
          onCheckedChange={v => onToggle(coupon.id, v)}
        />
        <Button size="sm" variant="ghost" onClick={() => onSelect(coupon)}>
          <BarChart2 className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(coupon)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(coupon.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// ─── Uses Panel ───────────────────────────────────────────────────────────────

function UsesPanel({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const { data, loading } = useQuery(GET_COUPON_USES, { variables: { couponId: coupon.id } });
  const uses: CouponUse[] = data?.couponUses?.uses ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onClose}>← Zurück</Button>
        <div>
          <h2 className="text-xl font-bold font-mono">{coupon.code}</h2>
          <p className="text-sm text-muted-foreground">{coupon.usedCount} Einlösungen</p>
        </div>
      </div>
      {loading ? (
        <Loader2 className="animate-spin mx-auto mt-8" />
      ) : (
        <div className="space-y-2">
          {uses.map(use => (
            <div key={use.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <div>
                <p className="font-medium text-sm">{use.customerEmail}</p>
                <p className="text-xs text-muted-foreground capitalize">{use.referenceType}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm text-green-600">-{fmt(use.discountAmount)}</p>
                <p className="text-xs text-muted-foreground">
                  {use.usedAt ? new Date(use.usedAt).toLocaleDateString('de-DE') : '—'}
                </p>
              </div>
            </div>
          ))}
          {uses.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Noch nicht eingelöst</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Coupon Dialog ────────────────────────────────────────────────────────────

function CouponDialog({
  open, editing, onClose, onSave,
}: {
  open: boolean;
  editing: Coupon | null;
  onClose: () => void;
  onSave: (form: FormState) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>({
    code:           editing?.code ?? '',
    type:           editing?.type ?? 'percent',
    value:          editing ? String(editing.type === 'fixed' ? editing.value / 100 : editing.value) : '',
    minOrderAmount: editing?.minOrderAmount ? String(editing.minOrderAmount / 100) : '',
    maxUses:        editing?.maxUses ? String(editing.maxUses) : '',
    expiresAt:      editing?.expiresAt ? editing.expiresAt.slice(0, 10) : '',
    applicableTo:   editing?.applicableModule ?? 'all',
    isActive:       editing?.isActive ?? true,
  });

  const set = (key: keyof FormState, val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }));

  const canSave = form.code.length >= 3 && (form.type === 'free_shipping' || form.value !== '');

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Gutschein bearbeiten' : 'Neuer Gutschein'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Code *</Label>
            <div className="flex gap-2">
              <Input
                className="font-mono uppercase"
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="SOMMER2025"
              />
              <Button variant="outline" size="sm" onClick={() => set('code', generateCode())}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Typ</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">% Prozent</SelectItem>
                  <SelectItem value="fixed">€ Festbetrag</SelectItem>
                  <SelectItem value="free_shipping">Gratisversand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{form.type === 'percent' ? 'Prozent (%)' : form.type === 'fixed' ? 'Betrag (€)' : 'Wert'}</Label>
              <Input
                type="number"
                step={form.type === 'percent' ? '1' : '0.01'}
                min="0"
                max={form.type === 'percent' ? '100' : undefined}
                disabled={form.type === 'free_shipping'}
                value={form.value}
                onChange={e => set('value', e.target.value)}
                placeholder={form.type === 'percent' ? '10' : '5.00'}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Mindestbestellwert (€)</Label>
              <Input
                type="number" step="0.01" min="0"
                value={form.minOrderAmount}
                onChange={e => set('minOrderAmount', e.target.value)}
                placeholder="20.00"
              />
            </div>
            <div>
              <Label>Max. Einlösungen</Label>
              <Input
                type="number" min="1"
                value={form.maxUses}
                onChange={e => set('maxUses', e.target.value)}
                placeholder="∞ unbegrenzt"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ablaufdatum</Label>
              <Input type="date" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
            </div>
            <div>
              <Label>Gültig für</Label>
              <Select value={form.applicableTo} onValueChange={v => set('applicableTo', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Module</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="local">Lokaler Handel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.isActive} onCheckedChange={v => set('isActive', v)} />
            <Label>Aktiv</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={() => void onSave(form)} disabled={!canSave}>
            {editing ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const { data, loading, refetch } = useQuery(GET_COUPONS);
  const [createCoupon] = useMutation(CREATE_COUPON);
  const [updateCoupon] = useMutation(UPDATE_COUPON);
  const [deleteCoupon] = useMutation(DELETE_COUPON);

  const [dialog, setDialog] = useState<{ open: boolean; editing: Coupon | null }>({ open: false, editing: null });
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const allCoupons: Coupon[] = data?.coupons?.coupons ?? [];

  const filtered = allCoupons.filter(c => {
    if (filter === 'active')  return c.isActive && !isExpired(c.expiresAt);
    if (filter === 'expired') return !c.isActive || isExpired(c.expiresAt);
    return true;
  });

  const openCreate = () => setDialog({ open: true, editing: null });
  const openEdit   = (c: Coupon) => setDialog({ open: true, editing: c });
  const closeDialog = () => setDialog({ open: false, editing: null });

  const save = async (form: FormState) => {
    const input = {
      code:           form.code,
      type:           form.type,
      value:          form.type === 'fixed'
                        ? Math.round(parseFloat(form.value) * 100)
                        : form.type === 'free_shipping'
                        ? 0
                        : parseInt(form.value),
      minOrderAmount: form.minOrderAmount ? Math.round(parseFloat(form.minOrderAmount) * 100) : undefined,
      maxUses:        form.maxUses ? parseInt(form.maxUses) : undefined,
      expiresAt:      form.expiresAt || undefined,
      applicableTo:   form.applicableTo,
      isActive:       form.isActive,
    };
    if (dialog.editing) {
      await updateCoupon({ variables: { id: dialog.editing.id, input } });
    } else {
      await createCoupon({ variables: { input } });
    }
    await refetch();
    closeDialog();
  };

  const del = async (id: string) => {
    if (!confirm('Gutschein löschen?')) return;
    await deleteCoupon({ variables: { id } });
    await refetch();
  };

  const toggle = async (id: string, isActive: boolean) => {
    await updateCoupon({ variables: { id, input: { isActive } } });
    await refetch();
  };

  if (selectedCoupon) {
    return (
      <div className="p-6">
        <UsesPanel coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-7 w-7" />
          <div>
            <h1 className="text-2xl font-bold">Gutscheine</h1>
            <p className="text-sm text-muted-foreground">Rabattcodes für Shop, Restaurant &amp; Lokaler Handel</p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Gutschein erstellen
        </Button>
      </div>

      <StatsBar coupons={allCoupons} />

      <div className="flex gap-2">
        {([
          { key: 'all',     label: 'Alle' },
          { key: 'active',  label: 'Aktiv' },
          { key: 'expired', label: 'Inaktiv / Abgelaufen' },
        ] as const).map(({ key, label }) => (
          <Button key={key} size="sm" variant={filter === key ? 'default' : 'outline'} onClick={() => setFilter(key)}>
            {label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg font-medium">Keine Gutscheine</p>
          <p className="text-sm text-muted-foreground">Erstelle deinen ersten Rabattcode</p>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ersten Gutschein erstellen</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <CouponRow
              key={c.id}
              coupon={c}
              onEdit={openEdit}
              onDelete={del}
              onToggle={toggle}
              onSelect={setSelectedCoupon}
            />
          ))}
        </div>
      )}

      <CouponDialog
        open={dialog.open}
        editing={dialog.editing}
        onClose={closeDialog}
        onSave={save}
      />
    </div>
  );
}