'use client';

import { useState, useEffect, useCallback } from 'react';

// ==================== TYPES ====================
interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date' | 'tel' | 'url';
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  order: number;
}

interface FormDefinition {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: FormField[];
  success_message: string;
  notification_email: string | null;
  is_active: boolean;
  submission_count: number;
  created_at: string;
}

interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, string>;
  is_read: boolean;
  created_at: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

// ==================== GRAPHQL HELPER ====================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

const FIELD_TYPES: Array<{ value: FormField['type']; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'E-Mail' },
  { value: 'textarea', label: 'Textbereich' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio-Buttons' },
  { value: 'number', label: 'Zahl' },
  { value: 'date', label: 'Datum' },
  { value: 'tel', label: 'Telefon' },
  { value: 'url', label: 'URL' },
];

// ==================== COMPONENT ====================
export default function FormBuilderDashboardPage() {
  const [view, setView] = useState<'list' | 'edit' | 'submissions'>('list');
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [editingForm, setEditingForm] = useState<Partial<FormDefinition> | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadForms = useCallback(async () => {
    try {
      const data = await gqlRequest<{ forms: FormDefinition[] }>(`
        query {
          forms {
            id name slug description fields success_message notification_email
            is_active submission_count created_at
          }
        }
      `);
      setForms(data.forms);
    } catch (err) {
      console.error('Fehler beim Laden der Formulare:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubmissions = useCallback(async (formId: string) => {
    try {
      const data = await gqlRequest<{ formSubmissions: FormSubmission[] }>(`
        query($formId: String!) {
          formSubmissions(formId: $formId) { id form_id data is_read created_at }
        }
      `, { formId });
      setSubmissions(data.formSubmissions);
    } catch (err) {
      console.error('Fehler beim Laden der Einträge:', err);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // ==================== FORM ACTIONS ====================
  const saveForm = async () => {
    if (!editingForm?.name) return;
    try {
      const input = {
        name: editingForm.name,
        description: editingForm.description || null,
        fields: JSON.stringify(editingForm.fields || []),
        successMessage: editingForm.success_message || 'Vielen Dank für Ihre Nachricht!',
        notificationEmail: editingForm.notification_email || null,
      };

      if (editingForm.id) {
        await gqlRequest(`
          mutation($id: String!, $input: UpdateFormInput!) { updateForm(formId: $id, input: $input) { id } }
        `, { id: editingForm.id, input });
      } else {
        await gqlRequest(`
          mutation($input: CreateFormInput!) { createForm(input: $input) { id } }
        `, { input });
      }
      showToast(editingForm.id ? 'Formular aktualisiert' : 'Formular erstellt');
      setView('list');
      setEditingForm(null);
      loadForms();
    } catch {
      showToast('Fehler beim Speichern', 'error');
    }
  };

  const deleteForm = async (id: string) => {
    if (!confirm('Formular wirklich löschen?')) return;
    try {
      await gqlRequest(`mutation($id: String!) { deleteForm(formId: $id) }`, { id });
      showToast('Formular gelöscht');
      loadForms();
    } catch {
      showToast('Fehler beim Löschen', 'error');
    }
  };

  // ==================== FIELD MANAGEMENT ====================
  const addField = () => {
    if (!editingForm) return;
    const fields = [...(editingForm.fields || [])];
    fields.push({
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Neues Feld',
      placeholder: '',
      required: false,
      options: [],
      order: fields.length,
    });
    setEditingForm({ ...editingForm, fields });
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    if (!editingForm) return;
    const fields = [...(editingForm.fields || [])];
    fields[index] = { ...fields[index], ...updates };
    setEditingForm({ ...editingForm, fields });
  };

  const removeField = (index: number) => {
    if (!editingForm) return;
    const fields = (editingForm.fields || []).filter((_, i) => i !== index);
    setEditingForm({ ...editingForm, fields });
  };

  const moveField = (index: number, direction: -1 | 1) => {
    if (!editingForm) return;
    const fields = [...(editingForm.fields || [])];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
    setEditingForm({ ...editingForm, fields });
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Formulare</h1>
        {view === 'list' && (
          <button
            onClick={() => {
              setEditingForm({
                name: '',
                description: null,
                fields: [],
                success_message: 'Vielen Dank für Ihre Nachricht!',
                notification_email: null,
              });
              setView('edit');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            + Neues Formular
          </button>
        )}
        {view !== 'list' && (
          <button onClick={() => { setView('list'); setEditingForm(null); }} className="text-sm text-gray-500 hover:underline">
            ← Zurück zur Liste
          </button>
        )}
      </div>

      {/* ==================== LIST VIEW ==================== */}
      {view === 'list' && (
        <div className="grid gap-4">
          {forms.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Noch keine Formulare erstellt</p>
          ) : (
            forms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{form.name}</h3>
                    <p className="text-sm text-gray-500">
                      {(form.fields || []).length} Felder &middot; {form.submission_count} Einträge &middot;
                      <span className="font-mono text-xs ml-1">/{form.slug}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedFormId(form.id);
                        loadSubmissions(form.id);
                        setView('submissions');
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Einträge ({form.submission_count})
                    </button>
                    <button
                      onClick={() => { setEditingForm(form); setView('edit'); }}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => deleteForm(form.id)}
                      className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================== EDIT VIEW ==================== */}
      {view === 'edit' && editingForm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="font-semibold text-lg">Einstellungen</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={editingForm.name || ''}
                onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Kontaktformular"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea
                value={editingForm.description || ''}
                onChange={(e) => setEditingForm({ ...editingForm, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Erfolgs-Nachricht</label>
              <input
                type="text"
                value={editingForm.success_message || ''}
                onChange={(e) => setEditingForm({ ...editingForm, success_message: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benachrichtigungs-E-Mail</label>
              <input
                type="email"
                value={editingForm.notification_email || ''}
                onChange={(e) => setEditingForm({ ...editingForm, notification_email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="admin@example.de"
              />
            </div>
            <button onClick={saveForm} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Formular speichern
            </button>
          </div>

          {/* Field Editor */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Felder</h3>
              <button onClick={addField} className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                + Feld hinzufügen
              </button>
            </div>

            {(editingForm.fields || []).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Noch keine Felder</p>
            ) : (
              <div className="space-y-3">
                {(editingForm.fields || []).map((field, idx) => (
                  <div key={field.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Move buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30">
                          ↑
                        </button>
                        <button onClick={() => moveField(idx, 1)} disabled={idx === (editingForm.fields || []).length - 1} className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30">
                          ↓
                        </button>
                      </div>

                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                        placeholder="Feldname"
                      />

                      <select
                        value={field.type}
                        onChange={(e) => updateField(idx, { type: e.target.value as FormField['type'] })}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {FIELD_TYPES.map((ft) => (
                          <option key={ft.value} value={ft.value}>{ft.label}</option>
                        ))}
                      </select>

                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(idx, { required: e.target.checked })}
                        />
                        Pflicht
                      </label>

                      <button onClick={() => removeField(idx)} className="text-red-400 hover:text-red-600 text-sm">
                        ✕
                      </button>
                    </div>

                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-xs text-gray-500"
                      placeholder="Platzhaltertext"
                    />

                    {/* Options for select/radio */}
                    {(field.type === 'select' || field.type === 'radio') && (
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Optionen (eine pro Zeile)</label>
                        <textarea
                          value={(field.options || []).join('\n')}
                          onChange={(e) => updateField(idx, { options: e.target.value.split('\n') })}
                          className="w-full border rounded px-2 py-1 text-xs"
                          rows={3}
                          placeholder={`Option 1\nOption 2\nOption 3`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SUBMISSIONS VIEW ==================== */}
      {view === 'submissions' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            Einträge {selectedFormId && `(${submissions.length})`}
          </h3>
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Noch keine Einträge</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className={`bg-white rounded-lg border p-4 ${!sub.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {new Date(sub.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!sub.is_read && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Neu</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(sub.data).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs text-gray-400">{key}</span>
                        <p className="text-sm text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}