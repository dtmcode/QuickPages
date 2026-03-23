interface TemplateProps {
  page: {
    title: string;
    content?: string;
  };
}

export function BlankTemplate({ page }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <div className="whitespace-pre-wrap">
        {page.content || page.title}
      </div>
    </div>
  );
}