'use client';
// frontend\src\app\dashboard\courses\page.tsx

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  GraduationCap, Users, BookOpen, Plus, Pencil, Trash2,
  Copy, ChevronRight, ChevronDown, Play, FileText, File,
  Euro, BarChart2, CheckCircle, Loader2, Crown, Lock, Unlock,
} from 'lucide-react';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_STATS = gql`
  query { coursesStats {
    totalCourses publishedCourses totalEnrollments activeMembers totalRevenue
  }}
`;

const GET_PLANS = gql`
  query { membershipPlans { plans {
    id name slug price interval features isActive isPublic memberCount createdAt
  } total }}
`;
const CREATE_PLAN = gql`
  mutation CreateMembershipPlan($input: CreateMembershipPlanInput!) {
    createMembershipPlan(input: $input) { id name }
  }
`;
const UPDATE_PLAN = gql`
  mutation UpdateMembershipPlan($id: ID!, $input: UpdateMembershipPlanInput!) {
    updateMembershipPlan(id: $id, input: $input) { id }
  }
`;
const DELETE_PLAN = gql`
  mutation DeleteMembershipPlan($id: ID!) { deleteMembershipPlan(id: $id) }
`;

const GET_MEMBERSHIPS = gql`
  query Memberships($status: String) { memberships(status: $status) { memberships {
    id customerEmail customerName status startedAt expiresAt grantedManually createdAt
    plan { id name price interval }
  } total }}
`;
const GRANT_MEMBERSHIP = gql`
  mutation GrantMembership($input: GrantMembershipInput!) {
    grantMembership(input: $input) { id }
  }
`;
const UPDATE_MEMBERSHIP_STATUS = gql`
  mutation UpdateMembershipStatus($id: ID!, $input: UpdateMembershipStatusInput!) {
    updateMembershipStatus(id: $id, input: $input) { id status }
  }
`;
const REVOKE_MEMBERSHIP = gql`
  mutation RevokeMembership($id: ID!) { revokeMembership(id: $id) }
`;

const GET_COURSES = gql`
  query { courses { courses {
    id title slug thumbnail price isFree isPublished level language
    totalDuration enrollmentCount requiresMembershipPlanId createdAt
    requiredPlan { id name }
    chapters { id title position isPublished
      lessons { id title type duration position isPublished isFreePreview }
    }
  } total }}
`;
const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) { id title }
  }
`;
const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) { id isPublished }
  }
`;
const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) { deleteCourse(id: $id) }
`;
const DUPLICATE_COURSE = gql`
  mutation DuplicateCourse($id: ID!) { duplicateCourse(id: $id) { id title } }
`;
const CREATE_CHAPTER = gql`
  mutation CreateChapter($input: CreateChapterInput!) {
    createChapter(input: $input) { id title }
  }
`;
const CREATE_LESSON = gql`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) { id title }
  }
`;
const DELETE_CHAPTER = gql`
  mutation DeleteChapter($id: ID!) { deleteChapter(id: $id) }
`;
const DELETE_LESSON = gql`
  mutation DeleteLesson($id: ID!) { deleteLesson(id: $id) }
`;

const GET_ENROLLMENTS = gql`
  query Enrollments($courseId: ID) { enrollments(courseId: $courseId) { enrollments {
    id courseId customerEmail customerName progress accessGrantedBy enrolledAt completedAt
    course { id title }
  } total }}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (cents: number) => `${(cents / 100).toFixed(2)} €`;
const fmtDur = (min: number) => min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Anfänger', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Fortgeschritten', color: 'bg-yellow-100 text-yellow-800' },
  advanced: { label: 'Experte', color: 'bg-red-100 text-red-800' },
};

const LESSON_ICONS: Record<string, any> = {
  video: Play,
  text: FileText,
  pdf: File,
  quiz: CheckCircle,
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
  trial: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const { data } = useQuery(GET_STATS);
  const s = data?.coursesStats;
  if (!s) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Kurse', value: `${s.publishedCourses}/${s.totalCourses}`, icon: BookOpen, sub: 'veröffentlicht' },
        { label: 'Einschreibungen', value: s.totalEnrollments, icon: GraduationCap, sub: 'gesamt' },
        { label: 'Aktive Mitglieder', value: s.activeMembers, icon: Crown, sub: 'Membership' },
        { label: 'Umsatz', value: fmt(s.totalRevenue), icon: Euro, sub: 'gesamt' },
      ].map(({ label, value, icon: Icon, sub }) => (
        <Card key={label}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Membership Plans Tab ─────────────────────────────────────────────────────

function PlansTab() {
  const { data, loading, refetch } = useQuery(GET_PLANS);
  const [createPlan] = useMutation(CREATE_PLAN);
  const [updatePlan] = useMutation(UPDATE_PLAN);
  const [deletePlan] = useMutation(DELETE_PLAN);
  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [form, setForm] = useState<any>({ name: '', description: '', price: '', interval: 'monthly', features: '', isPublic: true });

  const plans = data?.membershipPlans?.plans ?? [];

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', interval: 'monthly', features: '', isPublic: true });
    setDialog({ open: true });
  };

  const openEdit = (plan: any) => {
    setForm({ name: plan.name, description: plan.description ?? '', price: (plan.price / 100).toString(), interval: plan.interval, features: (plan.features ?? []).join('\n'), isPublic: plan.isPublic });
    setDialog({ open: true, editing: plan });
  };

  const save = async () => {
    const input = {
      name: form.name,
      description: form.description || undefined,
      price: Math.round(parseFloat(form.price) * 100),
      interval: form.interval,
      features: form.features ? form.features.split('\n').filter(Boolean) : [],
      isPublic: form.isPublic,
    };
    if (dialog.editing) {
      await updatePlan({ variables: { id: dialog.editing.id, input } });
    } else {
      await createPlan({ variables: { input } });
    }
    await refetch();
    setDialog({ open: false });
  };

  const del = async (id: string) => {
    if (!confirm('Plan löschen? Nur möglich wenn keine aktiven Mitglieder.')) return;
    try {
      await deletePlan({ variables: { id } });
      await refetch();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const INTERVAL_LABELS: Record<string, string> = { monthly: 'Monatlich', yearly: 'Jährlich', lifetime: 'Einmalig' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{plans.length} Pläne</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Plan erstellen</Button>
      </div>

      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan: any) => (
            <Card key={plan.id} className="relative">
              {!plan.isActive && <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center"><Badge variant="secondary">Inaktiv</Badge></div>}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />{plan.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{INTERVAL_LABELS[plan.interval] ?? plan.interval}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(plan)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => del(plan.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-bold">{fmt(plan.price)}<span className="text-sm font-normal text-muted-foreground">/{plan.interval === 'lifetime' ? 'einmalig' : plan.interval === 'monthly' ? 'Monat' : 'Jahr'}</span></p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{plan.memberCount} aktive Mitglieder</span>
                </div>
                {(plan.features ?? []).length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {plan.features.slice(0, 3).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" />{f}</li>
                    ))}
                    {plan.features.length > 3 && <li className="text-muted-foreground">+{plan.features.length - 3} mehr</li>}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
          {plans.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">Noch keine Pläne erstellt</div>}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={o => setDialog({ open: o })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog.editing ? 'Plan bearbeiten' : 'Neuer Membership-Plan'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="Basic, Premium, Pro..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Preis (€) *</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm((f: any) => ({ ...f, price: e.target.value }))} /></div>
              <div>
                <Label>Intervall</Label>
                <Select value={form.interval} onValueChange={v => setForm((f: any) => ({ ...f, interval: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                    <SelectItem value="lifetime">Einmalig (Lifetime)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Beschreibung</Label><Textarea rows={2} value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} /></div>
            <div>
              <Label>Features (eine pro Zeile)</Label>
              <Textarea rows={4} value={form.features} onChange={e => setForm((f: any) => ({ ...f, features: e.target.value }))} placeholder="Zugang zu allen Kursen&#10;Monatliche Live-Sessions&#10;Community-Zugang" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isPublic} onCheckedChange={v => setForm((f: any) => ({ ...f, isPublic: v }))} />
              <Label>Öffentlich sichtbar</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Abbrechen</Button>
            <Button onClick={save} disabled={!form.name || !form.price}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Memberships Tab ──────────────────────────────────────────────────────────

function MembershipsTab() {
  const { data: plansData } = useQuery(GET_PLANS);
  const [statusFilter, setStatusFilter] = useState<string | undefined>('active');
  const { data, loading, refetch } = useQuery(GET_MEMBERSHIPS, { variables: { status: statusFilter } });
  const [grantMembership] = useMutation(GRANT_MEMBERSHIP);
  const [updateStatus] = useMutation(UPDATE_MEMBERSHIP_STATUS);
  const [revoke] = useMutation(REVOKE_MEMBERSHIP);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ customerEmail: '', customerName: '', planId: '' });

  const plans = plansData?.membershipPlans?.plans ?? [];
  const memberships = data?.memberships?.memberships ?? [];

  const grant = async () => {
    await grantMembership({ variables: { input: { customerEmail: form.customerEmail, customerName: form.customerName, planId: form.planId || undefined } } });
    await refetch();
    setDialog(false);
    setForm({ customerEmail: '', customerName: '', planId: '' });
  };

  const cancel = async (id: string) => {
    await updateStatus({ variables: { id, input: { status: 'cancelled' } } });
    await refetch();
  };

  const del = async (id: string) => {
    if (!confirm('Membership komplett löschen?')) return;
    await revoke({ variables: { id } });
    await refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2">
          {[undefined, 'active', 'cancelled', 'expired', 'trial'].map(s => (
            <Button key={s ?? 'all'} size="sm" variant={statusFilter === s ? 'default' : 'outline'} onClick={() => setStatusFilter(s)}>
              {s === undefined ? 'Alle' : s === 'active' ? 'Aktiv' : s === 'cancelled' ? 'Storniert' : s === 'expired' ? 'Abgelaufen' : 'Trial'}
            </Button>
          ))}
        </div>
        <Button onClick={() => setDialog(true)}><Plus className="h-4 w-4 mr-2" />Membership vergeben</Button>
      </div>

      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="space-y-2">
          {memberships.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{m.customerEmail}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[m.status] ?? 'bg-gray-100'}`}>{m.status}</span>
                  {m.grantedManually && <Badge variant="outline" className="text-xs">Manuell</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{m.customerName}</p>
                {m.plan && <p className="text-xs text-muted-foreground"><Crown className="inline h-3 w-3 mr-1" />{m.plan.name} · {fmt(m.plan.price)}/{m.plan.interval}</p>}
                {m.expiresAt && <p className="text-xs text-muted-foreground">Läuft ab: {new Date(m.expiresAt).toLocaleDateString('de-DE')}</p>}
              </div>
              <div className="flex gap-2">
                {m.status === 'active' && (
                  <Button size="sm" variant="outline" onClick={() => cancel(m.id)}>Stornieren</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => del(m.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {memberships.length === 0 && <p className="text-center text-muted-foreground py-8">Keine Memberships gefunden</p>}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Membership manuell vergeben</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Email *</Label><Input value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} /></div>
            <div><Label>Name *</Label><Input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} /></div>
            <div>
              <Label>Plan (optional)</Label>
              <Select value={form.planId || 'none'} onValueChange={v => setForm(f => ({ ...f, planId: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Kein Plan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein spezifischer Plan</SelectItem>
                  {plans.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({fmt(p.price)})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Abbrechen</Button>
            <Button onClick={grant} disabled={!form.customerEmail || !form.customerName}>Vergeben</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Courses Tab ──────────────────────────────────────────────────────────────

function CoursesTab() {
  const { data: plansData } = useQuery(GET_PLANS);
  const { data, loading, refetch } = useQuery(GET_COURSES);
  const [createCourse] = useMutation(CREATE_COURSE);
  const [updateCourse] = useMutation(UPDATE_COURSE);
  const [deleteCourse] = useMutation(DELETE_COURSE);
  const [duplicateCourse] = useMutation(DUPLICATE_COURSE);
  const [createChapter] = useMutation(CREATE_CHAPTER);
  const [createLesson] = useMutation(CREATE_LESSON);
  const [deleteChapter] = useMutation(DELETE_CHAPTER);
  const [deleteLesson] = useMutation(DELETE_LESSON);

  const [dialog, setDialog] = useState<{ open: boolean; editing?: any }>({ open: false });
  const [form, setForm] = useState<any>({ title: '', shortDescription: '', price: '0', isFree: false, level: 'beginner', language: 'de', requiresMembershipPlanId: '' });
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [addingChapter, setAddingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [addingLesson, setAddingLesson] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'video', videoUrl: '', isFreePreview: false });

  const plans = plansData?.membershipPlans?.plans ?? [];
  const courses = data?.courses?.courses ?? [];

  const openCreate = () => {
    setForm({ title: '', shortDescription: '', price: '0', isFree: false, level: 'beginner', language: 'de', requiresMembershipPlanId: '' });
    setDialog({ open: true });
  };

  const save = async () => {
    const input = {
      title: form.title,
      shortDescription: form.shortDescription || undefined,
      price: form.isFree ? 0 : Math.round(parseFloat(form.price) * 100),
      isFree: form.isFree,
      level: form.level,
      language: form.language,
      requiresMembershipPlanId: form.requiresMembershipPlanId || undefined,
    };
    if (dialog.editing) {
      await updateCourse({ variables: { id: dialog.editing.id, input } });
    } else {
      await createCourse({ variables: { input } });
    }
    await refetch();
    setDialog({ open: false });
  };

  const del = async (id: string) => {
    if (!confirm('Kurs löschen?')) return;
    try {
      await deleteCourse({ variables: { id } });
      if (selectedCourse?.id === id) setSelectedCourse(null);
      await refetch();
    } catch (e: any) { alert(e.message); }
  };

  const duplicate = async (id: string) => {
    await duplicateCourse({ variables: { id } });
    await refetch();
  };

  const togglePublish = async (course: any) => {
    await updateCourse({ variables: { id: course.id, input: { isPublished: !course.isPublished } } });
    await refetch();
  };

  const addChapter = async () => {
    if (!selectedCourse || !chapterTitle) return;
    await createChapter({ variables: { input: { courseId: selectedCourse.id, title: chapterTitle } } });
    setChapterTitle('');
    setAddingChapter(false);
    await refetch();
  };

  const addLesson = async (chapterId: string) => {
    if (!selectedCourse) return;
    await createLesson({ variables: { input: { chapterId, courseId: selectedCourse.id, title: lessonForm.title, type: lessonForm.type, videoUrl: lessonForm.videoUrl || undefined, isFreePreview: lessonForm.isFreePreview } } });
    setLessonForm({ title: '', type: 'video', videoUrl: '', isFreePreview: false });
    setAddingLesson(null);
    await refetch();
  };

  const currentCourse = selectedCourse ? courses.find((c: any) => c.id === selectedCourse.id) ?? selectedCourse : null;

  // Kurs-Detail Ansicht
  if (currentCourse) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setSelectedCourse(null)}>← Zurück</Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{currentCourse.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={LEVEL_LABELS[currentCourse.level]?.color}>{LEVEL_LABELS[currentCourse.level]?.label}</Badge>
              {currentCourse.isFree ? <Badge variant="outline" className="text-green-600">Kostenlos</Badge> : <Badge variant="outline">{fmt(currentCourse.price)}</Badge>}
              {currentCourse.requiresMembershipPlanId && <Badge variant="outline" className="text-purple-600"><Lock className="h-3 w-3 mr-1" />Membership</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setForm({ title: currentCourse.title, shortDescription: currentCourse.shortDescription ?? '', price: (currentCourse.price / 100).toString(), isFree: currentCourse.isFree, level: currentCourse.level, language: currentCourse.language, requiresMembershipPlanId: currentCourse.requiresMembershipPlanId ?? '' }); setDialog({ open: true, editing: currentCourse }); }}>
              <Pencil className="h-4 w-4 mr-1" />Bearbeiten
            </Button>
            <Button size="sm" variant={currentCourse.isPublished ? 'outline' : 'default'} onClick={() => togglePublish(currentCourse)}>
              {currentCourse.isPublished ? '⏸ Verstecken' : '🚀 Veröffentlichen'}
            </Button>
          </div>
        </div>

        {/* Kapitel + Lektionen */}
        <div className="space-y-3">
          {[...(currentCourse.chapters ?? [])].sort((a: any, b: any) => a.position - b.position).map((chapter: any) => (
            <div key={chapter.id} className="border rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-3 bg-muted cursor-pointer"
                onClick={() => setExpandedChapters(prev => { const next = new Set(prev); next.has(chapter.id) ? next.delete(chapter.id) : next.add(chapter.id); return next; })}
              >
                <div className="flex items-center gap-2">
                  {expandedChapters.has(chapter.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-medium">{chapter.title}</span>
                  <Badge variant="secondary" className="text-xs">{chapter.lessons?.length ?? 0} Lektionen</Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); if (confirm('Kapitel löschen?')) deleteChapter({ variables: { id: chapter.id } }).then(() => refetch()); }}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>

              {expandedChapters.has(chapter.id) && (
                <div className="p-3 space-y-2">
                  {[...(chapter.lessons ?? [])].sort((a: any, b: any) => a.position - b.position).map((lesson: any) => {
                    const Icon = LESSON_ICONS[lesson.type] ?? Play;
                    return (
                      <div key={lesson.id} className="flex items-center justify-between p-2 border rounded bg-card">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{lesson.title}</span>
                          {lesson.isFreePreview && <Badge variant="outline" className="text-xs text-green-600">Vorschau</Badge>}
                          {lesson.duration > 0 && <span className="text-xs text-muted-foreground">{fmtDur(lesson.duration)}</span>}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => deleteLesson({ variables: { id: lesson.id } }).then(() => refetch())}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}

                  {addingLesson === chapter.id ? (
                    <div className="border rounded p-3 space-y-2 bg-muted/30">
                      <Input placeholder="Lektions-Titel" value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={lessonForm.type} onValueChange={v => setLessonForm(f => ({ ...f, type: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">🎥 Video</SelectItem>
                            <SelectItem value="text">📝 Text</SelectItem>
                            <SelectItem value="pdf">📄 PDF</SelectItem>
                            <SelectItem value="quiz">✅ Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                        {lessonForm.type === 'video' && <Input placeholder="Video-URL" value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))} />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={lessonForm.isFreePreview} onCheckedChange={v => setLessonForm(f => ({ ...f, isFreePreview: v }))} />
                        <Label className="text-xs">Kostenlose Vorschau</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => addLesson(chapter.id)} disabled={!lessonForm.title}>Hinzufügen</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingLesson(null)}>Abbrechen</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="w-full border-dashed border" onClick={() => setAddingLesson(chapter.id)}>
                      <Plus className="h-3 w-3 mr-1" />Lektion hinzufügen
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}

          {addingChapter ? (
            <div className="border rounded-lg p-3 space-y-2">
              <Input placeholder="Kapitel-Titel" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} autoFocus />
              <div className="flex gap-2">
                <Button size="sm" onClick={addChapter} disabled={!chapterTitle}>Erstellen</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingChapter(false)}>Abbrechen</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setAddingChapter(true)}>
              <Plus className="h-4 w-4 mr-2" />Kapitel hinzufügen
            </Button>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialog.open} onOpenChange={o => setDialog({ open: o })}>
          <DialogContent>
            <DialogHeader><DialogTitle>{dialog.editing ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titel *</Label><Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>Kurzbeschreibung</Label><Textarea rows={2} value={form.shortDescription} onChange={e => setForm((f: any) => ({ ...f, shortDescription: e.target.value }))} /></div>
              <div className="flex items-center gap-2"><Switch checked={form.isFree} onCheckedChange={v => setForm((f: any) => ({ ...f, isFree: v }))} /><Label>Kostenloser Kurs</Label></div>
              {!form.isFree && <div><Label>Preis (€)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm((f: any) => ({ ...f, price: e.target.value }))} /></div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Level</Label>
                  <Select value={form.level} onValueChange={v => setForm((f: any) => ({ ...f, level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Anfänger</SelectItem>
                      <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                      <SelectItem value="advanced">Experte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sprache</Label>
                  <Select value={form.language} onValueChange={v => setForm((f: any) => ({ ...f, language: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                      <SelectItem value="en">🇬🇧 Englisch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Membership erforderlich (optional)</Label>
                <Select value={form.requiresMembershipPlanId || 'none'} onValueChange={v => setForm((f: any) => ({ ...f, requiresMembershipPlanId: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="Keinen Plan erforderlich" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Plan erforderlich</SelectItem>
                    {plans.map((p: any) => <SelectItem key={p.id} value={p.id}><Crown className="inline h-3 w-3 mr-1" />{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialog({ open: false })}>Abbrechen</Button>
              <Button onClick={save} disabled={!form.title}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Kurs-Listen-Ansicht
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{courses.length} Kurse</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Kurs erstellen</Button>
      </div>

      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="space-y-2">
          {courses.map((course: any) => (
            <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:shadow-sm cursor-pointer" onClick={() => setSelectedCourse(course)}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{course.title}</p>
                  <Badge className={`text-xs ${LEVEL_LABELS[course.level]?.color}`}>{LEVEL_LABELS[course.level]?.label}</Badge>
                  {course.requiresMembershipPlanId && <Badge variant="outline" className="text-xs text-purple-600"><Lock className="h-3 w-3 mr-1" />Membership</Badge>}
                  {course.isFree && <Badge variant="outline" className="text-xs text-green-600">Kostenlos</Badge>}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mt-0.5">
                  {!course.isFree && <span>{fmt(course.price)}</span>}
                  <span>{course.chapters?.length ?? 0} Kapitel</span>
                  <span>{course.enrollmentCount} Einschreibungen</span>
                  {course.totalDuration > 0 && <span>{fmtDur(course.totalDuration)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                  {course.isPublished ? '🟢 Live' : '⚫ Entwurf'}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => duplicate(course.id)}><Copy className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => del(course.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Noch keine Kurse erstellt</p>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ersten Kurs erstellen</Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={o => setDialog({ open: o })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Neuer Kurs</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Titel *</Label><Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Kurzbeschreibung</Label><Textarea rows={2} value={form.shortDescription} onChange={e => setForm((f: any) => ({ ...f, shortDescription: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.isFree} onCheckedChange={v => setForm((f: any) => ({ ...f, isFree: v }))} /><Label>Kostenloser Kurs</Label></div>
            {!form.isFree && <div><Label>Preis (€)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm((f: any) => ({ ...f, price: e.target.value }))} /></div>}
            <div>
              <Label>Level</Label>
              <Select value={form.level} onValueChange={v => setForm((f: any) => ({ ...f, level: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Anfänger</SelectItem>
                  <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                  <SelectItem value="advanced">Experte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {plans.length > 0 && (
              <div>
                <Label>Membership erforderlich (optional)</Label>
                <Select value={form.requiresMembershipPlanId || 'none'} onValueChange={v => setForm((f: any) => ({ ...f, requiresMembershipPlanId: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="Kein Plan erforderlich" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Plan erforderlich</SelectItem>
                    {plans.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Abbrechen</Button>
            <Button onClick={save} disabled={!form.title}>Erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Enrollments Tab ──────────────────────────────────────────────────────────

function EnrollmentsTab() {
  const { data, loading } = useQuery(GET_ENROLLMENTS);
  const enrollments = data?.enrollments?.enrollments ?? [];

  const ACCESS_LABELS: Record<string, string> = {
    purchase: '💳 Kauf',
    membership: '👑 Membership',
    manual: '🔑 Manuell',
    free: '🆓 Kostenlos',
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{enrollments.length} Einschreibungen gesamt</p>
      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="space-y-2">
          {enrollments.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{e.customerEmail}</p>
                  <Badge variant="outline" className="text-xs">{ACCESS_LABELS[e.accessGrantedBy] ?? e.accessGrantedBy}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{e.course?.title ?? e.courseId}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={e.progress} className="h-1.5 w-24" />
                  <span className="text-xs text-muted-foreground">{e.progress}%</span>
                  {e.completedAt && <Badge variant="outline" className="text-xs text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Abgeschlossen</Badge>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString('de-DE') : ''}
              </p>
            </div>
          ))}
          {enrollments.length === 0 && <p className="text-center text-muted-foreground py-8">Noch keine Einschreibungen</p>}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-7 w-7" />
        <div>
          <h1 className="text-2xl font-bold">Kurse & Membership</h1>
          <p className="text-sm text-muted-foreground">Digitale Produkte, Mitgliedschaften und Kurs-Verwaltung</p>
        </div>
      </div>

      <StatsBar />

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses"><BookOpen className="h-4 w-4 mr-2" />Kurse</TabsTrigger>
          <TabsTrigger value="plans"><Crown className="h-4 w-4 mr-2" />Membership-Pläne</TabsTrigger>
          <TabsTrigger value="members"><Users className="h-4 w-4 mr-2" />Mitglieder</TabsTrigger>
          <TabsTrigger value="enrollments"><GraduationCap className="h-4 w-4 mr-2" />Einschreibungen</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="mt-4"><CoursesTab /></TabsContent>
        <TabsContent value="plans" className="mt-4"><PlansTab /></TabsContent>
        <TabsContent value="members" className="mt-4"><MembershipsTab /></TabsContent>
        <TabsContent value="enrollments" className="mt-4"><EnrollmentsTab /></TabsContent>
      </Tabs>
    </div>
  );
}