'use client';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const GET_TEMPLATES = gql`
  query GetTemplates($tenantId: String!) {
    wbTemplates(tenantId: $tenantId) {
      id
      name
      description
      thumbnailUrl
      isActive
      isDefault
      createdAt
      updatedAt
    }
  }
`;

const GET_GLOBAL_TEMPLATES_PREVIEW = gql`
  query GetGlobalTemplatesPreview {
    wbGlobalTemplates(limit: 3) {
      id
      name
      description
      category
      thumbnailUrl
      isPremium
    }
  }
`;

const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!, $tenantId: String!) {
    createTemplate(input: $input, tenantId: $tenantId) {
      id
      name
      description
      thumbnailUrl
      isActive
      isDefault
      createdAt
    }
  }
`;

const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($id: String!, $input: UpdateTemplateInput!, $tenantId: String!) {
    updateTemplate(id: $id, input: $input, tenantId: $tenantId) {
      id
      name
      description
      thumbnailUrl
      updatedAt
    }
  }
`;

const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: String!, $tenantId: String!) {
    deleteTemplate(id: $id, tenantId: $tenantId)
  }
`;

export default function TemplatesListPage() {
  const { tenant } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const { data, loading, refetch } = useQuery(GET_TEMPLATES, {
    variables: { tenantId: tenant?.id },
    skip: !tenant?.id,
  });

  const { data: globalData, loading: globalLoading } = useQuery(GET_GLOBAL_TEMPLATES_PREVIEW);

  const [createTemplate] = useMutation(CREATE_TEMPLATE);
  const [updateTemplate] = useMutation(UPDATE_TEMPLATE);
  const [deleteTemplate] = useMutation(DELETE_TEMPLATE);

  const templates = data?.wbTemplates || [];
  const globalTemplates = globalData?.wbGlobalTemplates || [];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createTemplate({
        variables: {
          input: {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            thumbnailUrl: formData.get('thumbnailUrl') as string,
            isActive: true,
            isDefault: false,
          },
          tenantId: tenant.id,
        },
      });
      alert('✅ Template erstellt!');
      setShowForm(false);
      refetch();
    } catch (error: any) {
      alert(`❌ Fehler: ${error.message}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await updateTemplate({
        variables: {
          id: editingTemplate.id,
          input: {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            thumbnailUrl: formData.get('thumbnailUrl') as string,
          },
          tenantId: tenant.id,
        },
      });
      alert('✅ Template aktualisiert!');
      setEditingTemplate(null);
      refetch();
    } catch (error: any) {
      alert(`❌ Fehler: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      await deleteTemplate({
        variables: { id, tenantId: tenant.id },
      });
      alert('✅ Template gelöscht!');
      refetch();
    } catch (error: any) {
      alert(`❌ Fehler: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt Templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground transition-colors duration-300">
            Website Templates
          </h1>
          <p className="text-muted-foreground mt-1 transition-colors duration-300">
            {templates.length} Template{templates.length !== 1 ? 's' : ''} vorhanden
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-md"
        >
          {showForm ? 'Abbrechen' : '+ Neues Template'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 transition-colors duration-300">
              Neues Template erstellen
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="create-name">Name *</Label>
                <input 
                  id="create-name"
                  name="name" 
                  type="text" 
                  required 
                  placeholder="z.B. Business Template" 
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="create-description">Beschreibung</Label>
                <textarea 
                  id="create-description"
                  name="description" 
                  rows={3} 
                  placeholder="Beschreibe dein Template..." 
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="create-thumbnail">Thumbnail URL</Label>
                <input 
                  id="create-thumbnail"
                  name="thumbnailUrl" 
                  type="text" 
                  placeholder="https://..." 
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 shadow-md"
                >
                  Template erstellen
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="bg-muted text-foreground px-6 py-2 rounded-lg hover:bg-muted/80 transition-all duration-300"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingTemplate && (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 transition-colors duration-300">
              Template bearbeiten
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <input 
                  id="edit-name"
                  name="name" 
                  type="text" 
                  required 
                  defaultValue={editingTemplate.name} 
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Beschreibung</Label>
                <textarea 
                  id="edit-description"
                  name="description" 
                  rows={3} 
                  defaultValue={editingTemplate.description} 
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
              <div>
                <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
                <input 
                  id="edit-thumbnail"
                  name="thumbnailUrl" 
                  type="text" 
                  defaultValue={editingTemplate.thumbnailUrl} 
                  className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 shadow-md"
                >
                  Speichern
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingTemplate(null)} 
                  className="bg-muted text-foreground px-6 py-2 rounded-lg hover:bg-muted/80 transition-all duration-300"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid - KLEINER */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {templates.map((template: any) => (
            <Card key={template.id} className="shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden">
              {template.thumbnailUrl ? (
                <div className="h-32 bg-muted overflow-hidden">
                  <img 
                    src={template.thumbnailUrl} 
                    alt={template.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-4xl">
                  📄
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-1">
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 transition-colors duration-300">
                  {template.description || 'Keine Beschreibung'}
                </p>
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium transition-all duration-300 ${
                    template.isActive 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30' 
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {template.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                  {template.isDefault && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/30 transition-all duration-300">
                      Standard
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Link 
                    href={`/dashboard/website-builder/website-templates/${template.id}`} 
                    className="w-full bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all duration-300 text-xs text-center shadow-sm"
                  >
                    Öffnen
                  </Link>
                  <button 
                    onClick={() => setEditingTemplate(template)} 
                    className="w-full bg-muted text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-all duration-300 text-xs border border-border"
                  >
                    Bearbeiten
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id)} 
                    className="w-full bg-red-600 dark:bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300 text-xs shadow-sm"
                  >
                    Löschen
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-md">
          <CardContent className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-foreground mb-2 transition-colors duration-300">
              Keine Templates vorhanden
            </h3>
            <p className="text-muted-foreground mb-6 transition-colors duration-300">
              Erstelle dein erstes Template, um loszulegen!
            </p>
            <button 
              onClick={() => setShowForm(true)} 
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-md"
            >
              Erstes Template erstellen
            </button>
          </CardContent>
        </Card>
      )}

      {/* Global Templates Section - KLEINER */}
      {!globalLoading && globalTemplates.length > 0 && (
        <div className="border-t border-border pt-12 mt-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2 transition-colors duration-300">
                🌟 Beliebte Vorlagen
              </h2>
              <p className="text-muted-foreground transition-colors duration-300">
                Starte mit einem professionellen Template
              </p>
            </div>
            <Link 
              href="/dashboard/website-builder/website-templates/global-templates" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg"
            >
              Alle Vorlagen ansehen →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {globalTemplates.map((template: any) => (
              <Card 
                key={template.id} 
                className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10 border-purple-500/20 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                {template.thumbnailUrl && (
                  <div className="h-32 bg-card overflow-hidden">
                    <img 
                      src={template.thumbnailUrl} 
                      alt={template.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <h3 className="text-base font-bold text-foreground transition-colors duration-300 line-clamp-1 flex-1">
                      {template.name}
                    </h3>
                    {template.isPremium && (
                      <span className="text-sm">⭐</span>
                    )}
                  </div>
                  {template.category && (
                    <span className="inline-block px-2 py-0.5 bg-purple-600 dark:bg-purple-500 text-white rounded-full text-xs font-semibold mb-2">
                      {template.category}
                    </span>
                  )}
                  <p className="text-xs text-foreground mb-3 line-clamp-2 transition-colors duration-300">
                    {template.description}
                  </p>
                  <Link 
                    href={`/dashboard/website-builder/website-templates/global-templates/${template.id}`}
                    className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 text-center text-xs font-semibold shadow-md"
                  >
                    Vorlage verwenden
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Global Templates */}
      {!globalLoading && globalTemplates.length === 0 && (
        <div className="border-t border-border pt-12 mt-12">
          <Card className="shadow-md">
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-foreground mb-2 transition-colors duration-300">
                Keine globalen Vorlagen verfügbar
              </h3>
              <p className="text-muted-foreground transition-colors duration-300">
                Derzeit sind keine fertigen Templates verfügbar.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}