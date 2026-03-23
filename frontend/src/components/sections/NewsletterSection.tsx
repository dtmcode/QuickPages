'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/lib/toast';

const SUBSCRIBE_NEWSLETTER = gql`
  mutation SubscribeNewsletter($email: String!, $firstName: String, $lastName: String) {
    subscribeNewsletter(input: { email: $email, firstName: $firstName, lastName: $lastName }) {
      id
      email
      status
    }
  }
`;

interface NewsletterSectionProps {
  config?: {
    title?: string;
    subtitle?: string;
    style?: 'inline' | 'card';
    showNameFields?: boolean;
    backgroundColor?: string;
  };
}

export function NewsletterSection({ config }: NewsletterSectionProps) {
  const {
    title = 'Subscribe to our Newsletter',
    subtitle = 'Get the latest updates and offers directly to your inbox',
    style = 'card',
    showNameFields = false,
    backgroundColor,
  } = config || {};

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [subscribe, { loading }] = useMutation(SUBSCRIBE_NEWSLETTER, {
    onCompleted: () => {
      setIsSuccess(true);
      toast.success('Successfully subscribed!');
      setEmail('');
      setFirstName('');
      setLastName('');
      setTimeout(() => setIsSuccess(false), 5000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await subscribe({
      variables: {
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      },
    });
  };

  const content = (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mb-8">
        <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
          <span className="text-4xl">📧</span>
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>

      {isSuccess ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <span className="text-8xl">✅</span>
          <p className="text-lg font-semibold">Thank you for subscribing!</p>
          <p className="text-muted-foreground">
            Check your email to confirm your subscription.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {showNameFields && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <span>⏳</span> : 'Subscribe'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </form>
      )}
    </div>
  );

  if (style === 'card') {
    return (
      <section
        className="container mx-auto px-4 py-24"
        style={{ backgroundColor }}
      >
        <Card className="p-12">{content}</Card>
      </section>
    );
  }

  return (
    <section
      className="container mx-auto px-4 py-24"
      style={{ backgroundColor }}
    >
      {content}
    </section>
  );
}