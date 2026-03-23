'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  thumbnail?: string;
  isPreset: boolean;
  templateSections?: Array<{
    id: string;
    section?: {
      type: string;
    };
  }>;
}

interface TemplateCardProps {
  template: Template;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onApply?: (template: Template) => void;
  isActive?: boolean;
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onPreview,
  onApply,
  isActive = false,
}: TemplateCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {template.thumbnail ? (
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="text-4xl">🎨</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute left-2 top-2 flex gap-2">
          {template.isPreset && (
            <Badge variant="secondary" className="text-xs">
              Preset
            </Badge>
          )}
          {isActive && (
            <Badge variant="default" className="text-xs">
              <span className="mr-1">✓</span>
              Active
            </Badge>
          )}
        </div>

        {/* Category */}
        <div className="absolute right-2 top-2">
          <Badge variant="outline" className="text-xs capitalize">
            {template.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{template.name}</h3>
        {template.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {template.description}
          </p>
        )}

        <div className="mb-4 flex flex-wrap gap-1">
          {template.templateSections?.slice(0, 3).map((ts) => (
            <Badge key={ts.id} variant="secondary" className="text-xs">
              {ts.section?.type}
            </Badge>
          ))}
          {template.templateSections && template.templateSections.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{template.templateSections.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {onPreview && (
            <Button variant="outline" size="sm" onClick={() => onPreview(template)}>
              <span className="mr-2">👁️</span>
              Preview
            </Button>
          )}
          
          {!template.isPreset && onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(template)}>
              <span className="mr-2">✏️</span>
              Edit
            </Button>
          )}
          
          {onApply && !isActive && (
            <Button size="sm" onClick={() => onApply(template)}>
              <span className="mr-2">✓</span>
              Apply
            </Button>
          )}
          
          {!template.isPreset && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(template)}
              className="ml-auto"
            >
              <span>🗑️</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}