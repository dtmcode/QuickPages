'use client';
// frontend\src\app\dashboard\funnels\page.tsx

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Funnel as FunnelIcon, Plus, Pencil, Trash2, Copy,
  BarChart2, Users, Eye, MousePointerClick,
  ChevronRight, Globe, Loader2, ArrowRight,
} from 'lucide-react';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_FUNNELS = gql`
  query { funnels { funnels {
    id name slug description isActive isPublished conversionGoal
    totalViews totalConversions createdAt updatedAt
    steps { id title stepType position isActive views conversions }
  } total }}
`;

const CREATE_FUNNEL = gql`
  mutation CreateFunnel($input: CreateFunnelInput!) {
    createFunnel(input: $input) { id slug steps { id } }
  }
`;

const UPDATE_FUNNEL = gql`
  mutation UpdateFunnel($id: ID!, $input: UpdateFunnelInput!) {
    updateFunnel(id: $id, input: $input) { id isPublished isActive }
  }
`;

const DELETE_FUNNEL = gql`
  mutation DeleteFunnel($id: ID!) { deleteFunnel(id: $id) }
`;

const DUPLICATE_FUNNEL = gql`
  mutation DuplicateFunnel($id: ID!) {
    duplicateFunnel(id: $id) { id name }
  }
`;

const GET_SUBMISSIONS = gql`
  query FunnelSubmissions($funnelId: ID!) {
    funnelSubmissions(funnelId: $funnelId) { submissions {
      id customerEmail customerName utmSource utmCampaign convertedAt createdAt
    } total }
  }
`;

const GET_ANALYTICS = gql`
  query FunnelAnalytics($funnelId: ID!) {
    funnelAnalytics(funnelId: $funnelId) {
      funnelId funnelName totalViews totalConversions overallConversionRate
      steps { stepId stepTitle stepType position views conversions conversionRate dropOffRate }
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEP_TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  optin:     { label: 'Opt-in',       color: 'bg-blue-100 text-blue-800',   icon: '📧' },
  sales:     { label: 'Sales',        color: 'bg-green-100 text-green-800', icon: '💰' },
  upsell:    { label: 'Upsell',       color: 'bg-yellow-100 text-yellow-800', icon: '⬆️' },
  downsell:  { label: 'Downsell',     color: 'bg-orange-100 text-orange-800', icon: '⬇️' },
  thankyou:  { label: 'Danke-Seite',  color: 'bg-purple-100 text-purple-800', icon: '🎉' },
  video:     { label: 'Video',        color: 'bg-red-100 text-red-800',     icon: '🎥' },
};

const GOAL_LABELS: Record<string, string> = {
  email: '📧 Lead erfassen',
  purchase: '💳 Verkauf',
  booking: '📅 Buchung',
};

// ─── Funnel Card ──────────────────────────────────────────────────────────────

function FunnelCard({
  funnel,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePublish,
  onSelect,
}: any) {
  const convRate = funnel.totalViews > 0
    ? ((funnel.totalConversions / funnel.totalViews) * 100).toFixed(1)
    : '0.0';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 cursor-pointer" onClick={() => onSelect(funnel)}>
            <CardTitle className="text-base">{funnel.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">/{funnel.slug}</p>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => onDuplicate(funnel.id)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(funnel)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(funnel.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Schritte Visual */}
        <div className="flex items-center gap-1 flex-wrap">
          {[...(funnel.steps ?? [])].sort((a: any, b: any) => a.position - b.position).map((step: any, i: number) => {
            const t = STEP_TYPE_LABELS[step.stepType] ?? { label: step.stepType, color: 'bg-gray-100 text-gray-600', icon: '📄' };
            return (
              <div key={step.id} className="flex items-center gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.color}`}>
                  {t.icon} {t.label}
                </span>
                {i < funnel.steps.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            );
          })}
          {funnel.steps?.length === 0 && <span className="text-xs text-muted-foreground">Keine Schritte</span>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded p-2">
            <p className="text-xs text-muted-foreground">Views</p>
            <p className="font-bold text-sm">{funnel.totalViews.toLocaleString('de-DE')}</p>
          </div>
          <div className="bg-muted rounded p-2">
            <p className="text-xs text-muted-foreground">Leads</p>
            <p className="font-bold text-sm">{funnel.totalConversions.toLocaleString('de-DE')}</p>
          </div>
          <div className="bg-muted rounded p-2">
            <p className="text-xs text-muted-foreground">Rate</p>
            <p className="font-bold text-sm text-green-600">{convRate}%</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">{GOAL_LABELS[funnel.conversionGoal] ?? funnel.conversionGoal}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{funnel.isPublished ? 'Live' : 'Entwurf'}</span>
            <Switch
              checked={funnel.isPublished}
              onCheckedChange={v => onTogglePublish(funnel.id, v)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Submissions Panel ────────────────────────────────────────────────────────

function SubmissionsPanel({ funnelId }: { funnelId: string }) {
  const { data, loading } = useQuery(GET_SUBMISSIONS, { variables: { funnelId } });
  const submissions = data?.funnelSubmissions?.submissions ?? [];

  if (loading) return <Loader2 className="animate-spin mx-auto mt-4" />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{submissions.length} Leads</p>
      <div className="space-y-2">
        {submissions.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div>
              <p className="font-medium text-sm">{s.customerEmail}</p>
              {s.customerName && <p className="text-xs text-muted-foreground">{s.customerName}</p>}
              {s.utmSource && <p className="text-xs text-muted-foreground">Quelle: {s.utmSource} {s.utmCampaign && `· ${s.utmCampaign}`}</p>}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(s.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
        ))}
        {submissions.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Noch keine Submissions</p>
        )}
      </div>
    </div>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────

function AnalyticsPanel({ funnelId }: { funnelId: string }) {
  const { data, loading } = useQuery(GET_ANALYTICS, { variables: { funnelId } });
  const analytics = data?.funnelAnalytics;

  if (loading) return <Loader2 className="animate-spin mx-auto mt-4" />;
  if (!analytics) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Gesamt Views', value: analytics.totalViews.toLocaleString('de-DE'), icon: Eye },
          { label: 'Conversions', value: analytics.totalConversions.toLocaleString('de-DE'), icon: MousePointerClick },
          { label: 'Conversion Rate', value: analytics.overallConversionRate, icon: BarChart2 },
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

      {/* Step-by-Step Funnel */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Schritt-Analyse</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[...(analytics.steps ?? [])].sort((a: any, b: any) => a.position - b.position).map((step: any) => {
            const t = STEP_TYPE_LABELS[step.stepType] ?? { label: step.stepType, color: 'bg-gray-100 text-gray-600', icon: '📄' };
            const convNum = parseFloat(step.conversionRate);
            return (
              <div key={step.stepId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.color}`}>{t.icon} {step.stepTitle}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span><Eye className="inline h-3 w-3 mr-1" />{step.views}</span>
                    <span><MousePointerClick className="inline h-3 w-3 mr-1" />{step.conversions}</span>
                    <span className="text-green-600 font-medium">{step.conversionRate}</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(convNum, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FunnelsPage() {
  const { data, loading, refetch } = useQuery(GET_FUNNELS);
  const [createFunnel] = useMutation(CREATE_FUNNEL);
  const [updateFunnel] = useMutation(UPDATE_FUNNEL);
  const [deleteFunnel] = useMutation(DELETE_FUNNEL);
  const [duplicateFunnel] = useMutation(DUPLICATE_FUNNEL);

  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [form, setForm] = useState({ name: '', description: '', conversionGoal: 'email' });
  const [selectedFunnel, setSelectedFunnel] = useState<any>(null);

  const funnelsList = data?.funnels?.funnels ?? [];

  const openCreate = () => {
    setForm({ name: '', description: '', conversionGoal: 'email' });
    setDialog({ open: true });
  };

  const openEdit = (funnel: any) => {
    setForm({ name: funnel.name, description: funnel.description ?? '', conversionGoal: funnel.conversionGoal });
    setDialog({ open: true, editing: funnel });
  };

  const save = async () => {
    if (dialog.editing) {
      await updateFunnel({ variables: { id: dialog.editing.id, input: { name: form.name, description: form.description, conversionGoal: form.conversionGoal } } });
    } else {
      const { data: res } = await createFunnel({ variables: { input: form } });
      if (res?.createFunnel) setSelectedFunnel(res.createFunnel);
    }
    await refetch();
    setDialog({ open: false });
  };

  const del = async (id: string) => {
    if (!confirm('Funnel löschen? Alle Submissions gehen verloren.')) return;
    await deleteFunnel({ variables: { id } });
    if (selectedFunnel?.id === id) setSelectedFunnel(null);
    await refetch();
  };

  const duplicate = async (id: string) => {
    await duplicateFunnel({ variables: { id } });
    await refetch();
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    await updateFunnel({ variables: { id, input: { isPublished } } });
    await refetch();
  };

  // Detail-Ansicht wenn Funnel ausgewählt
  if (selectedFunnel) {
    const funnel = funnelsList.find((f: any) => f.id === selectedFunnel.id) ?? selectedFunnel;
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setSelectedFunnel(null)}>← Zurück</Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{funnel.name}</h1>
            <p className="text-sm text-muted-foreground">/{funnel.slug}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={funnel.isPublished ? 'default' : 'secondary'}>
              {funnel.isPublished ? '🟢 Live' : '⚫ Entwurf'}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => openEdit(funnel)}>
              <Pencil className="h-4 w-4 mr-1" />Bearbeiten
            </Button>
          </div>
        </div>

        {/* Schritte + Builder Hinweis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Funnel-Schritte
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />Schritt hinzufügen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {[...(funnel.steps ?? [])].sort((a: any, b: any) => a.position - b.position).map((step: any, i: number) => {
                const t = STEP_TYPE_LABELS[step.stepType] ?? { label: step.stepType, color: 'bg-gray-100', icon: '📄' };
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className={`border-2 rounded-lg p-3 text-center min-w-[120px] cursor-pointer hover:shadow-md ${step.isActive ? 'border-primary' : 'border-muted opacity-60'}`}>
                      <p className="text-lg">{t.icon}</p>
                      <p className="text-xs font-medium mt-1">{step.title}</p>
                      <p className={`text-xs mt-1 px-1 rounded ${t.color}`}>{t.label}</p>
                      <div className="flex gap-2 justify-center mt-2 text-xs text-muted-foreground">
                        <span><Eye className="inline h-3 w-3" /> {step.views}</span>
                        <span><MousePointerClick className="inline h-3 w-3" /> {step.conversions}</span>
                      </div>
                    </div>
                    {i < funnel.steps.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                  </div>
                );
              })}
              {funnel.steps?.length === 0 && (
                <p className="text-muted-foreground text-sm">Noch keine Schritte — klicke auf &ldquo;Schritt hinzufügen&quot;</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              💡 Klicke auf einen Schritt um ihn im Website Builder zu bearbeiten
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="analytics">
          <TabsList>
            <TabsTrigger value="analytics"><BarChart2 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="submissions"><Users className="h-4 w-4 mr-2" />Leads</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="mt-4">
            <AnalyticsPanel funnelId={funnel.id} />
          </TabsContent>
          <TabsContent value="submissions" className="mt-4">
            <SubmissionsPanel funnelId={funnel.id} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Listen-Ansicht
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FunnelIcon className="h-7 w-7" />
          <div>
            <h1 className="text-2xl font-bold">Sales Funnels</h1>
            <p className="text-sm text-muted-foreground">
              {funnelsList.length} Funnel{funnelsList.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Funnel erstellen
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>
      ) : funnelsList.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <FunnelIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg font-medium">Noch keine Funnels</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Erstelle deinen ersten Funnel — Lead-Magnet, Produkt-Launch, Webinar-Anmeldung...
          </p>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ersten Funnel erstellen</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funnelsList.map((funnel: any) => (
            <FunnelCard
              key={funnel.id}
              funnel={funnel}
              onEdit={openEdit}
              onDelete={del}
              onDuplicate={duplicate}
              onTogglePublish={togglePublish}
              onSelect={setSelectedFunnel}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialog.open} onOpenChange={o => setDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.editing ? 'Funnel bearbeiten' : 'Neuen Funnel erstellen'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Lead-Magnet Funnel, Produkt-Launch..."
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Conversion-Ziel</Label>
              <Select value={form.conversionGoal} onValueChange={v => setForm(f => ({ ...f, conversionGoal: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Lead / E-Mail sammeln</SelectItem>
                  <SelectItem value="purchase">💳 Produkt verkaufen</SelectItem>
                  <SelectItem value="booking">📅 Buchung generieren</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Abbrechen</Button>
            <Button onClick={save} disabled={!form.name}>
              {dialog.editing ? 'Speichern' : 'Funnel erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}