'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/toast';

const SEND_CONTACT_EMAIL = gql`
  mutation SendContactEmail($input: ContactEmailInput!) {
    sendContactEmail(input: $input)
  }
`;

interface ContactSectionProps {
  config?: {
    title?: string;
    subtitle?: string;
    showContactInfo?: boolean;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export function ContactSection({ config }: ContactSectionProps) {
  const {
    title = 'Get in Touch',
    subtitle = "Have a question? We'd love to hear from you.",
    showContactInfo = true,
    email: contactEmail = 'hello@example.com',
    phone = '+49 123 456 789',
    address = 'Berlin, Germany',
  } = config || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [sendEmail, { loading }] = useMutation(SEND_CONTACT_EMAIL, {
    onCompleted: () => {
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendEmail({ variables: { input: formData } });
  };

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        {/* Contact Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                Subject
              </label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <span className="mr-2">⏳</span> : <span className="mr-2">📤</span>}
              Send Message
            </Button>
          </form>
        </Card>

        {/* Contact Info */}
        {showContactInfo && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">{contactEmail}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <span className="text-2xl">📞</span>
                </div>
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-muted-foreground">{phone}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-muted-foreground">{address}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}