// 📂 PFAD: scripts/translate.ts
// Übersetzt messages/de.json automatisch in alle 12 anderen Sprachen via OpenAI
// Run: npx ts-node --transpile-only scripts/translate.ts

import fs from 'fs';
import path from 'path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY fehlt in .env');

const LOCALES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  nl: 'Dutch',
  pl: 'Polish',
  tr: 'Turkish',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
  ja: 'Japanese',
  zh: 'Chinese (Simplified)',
};

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const SOURCE_FILE = path.join(MESSAGES_DIR, 'de.json');

// Extrahiert alle Strings aus einem JSON-Objekt (flach)
function extractStrings(obj: unknown, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  if (typeof obj === 'string') {
    result[prefix] = obj;
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      Object.assign(result, extractStrings(item, `${prefix}[${i}]`));
    });
  } else if (obj && typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      Object.assign(result, extractStrings(val, prefix ? `${prefix}.${key}` : key));
    }
  }
  return result;
}

async function translateBatch(
  strings: Record<string, string>,
  targetLocale: string,
  targetLanguage: string,
): Promise<Record<string, string>> {
  const entries = Object.entries(strings);
  if (entries.length === 0) return {};

  // Sende als JSON-Object zum Übersetzen
  const payload = Object.fromEntries(entries);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the values of this JSON object from German to ${targetLanguage}.
Rules:
- Keep JSON keys exactly as-is
- Keep emojis, HTML tags, currency symbols (€), and product names (myquickpage, Stripe, WordPress, Shopify, DSGVO) unchanged
- Keep placeholders like {name} unchanged
- Return ONLY valid JSON, no explanation, no markdown
- Maintain the same tone (professional but friendly)`,
        },
        {
          role: 'user',
          content: JSON.stringify(payload),
        },
      ],
    }),
  });

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  const content = data.choices[0].message.content.trim();

  // Strip markdown code blocks if present
  const clean = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    console.error(`❌ JSON parse error for ${targetLocale}:`, content.slice(0, 200));
    return {};
  }
}

// Setzt einen übersetzten Wert zurück in die verschachtelte Struktur
function setNestedValue(obj: Record<string, unknown>, keyPath: string, value: unknown): void {
  const parts = keyPath.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) current[part] = {};
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

async function translateLocale(
  sourceObj: Record<string, unknown>,
  locale: string,
  language: string,
): Promise<Record<string, unknown>> {
  console.log(`\n🌐 Übersetze → ${language} (${locale})...`);

  // Alle Strings extrahieren
  const allStrings = extractStrings(sourceObj);
  const stringEntries = Object.entries(allStrings);

  // In Batches von 50 aufteilen (OpenAI Token-Limit)
  const BATCH_SIZE = 50;
  const translated: Record<string, string> = {};

  for (let i = 0; i < stringEntries.length; i += BATCH_SIZE) {
    const batch = Object.fromEntries(stringEntries.slice(i, i + BATCH_SIZE));
    const batchTranslated = await translateBatch(batch, locale, language);
    Object.assign(translated, batchTranslated);
    process.stdout.write('.');
  }

  // Ergebnis in Original-Struktur zurücksetzen
  const result: Record<string, unknown> = JSON.parse(JSON.stringify(sourceObj));
  for (const [keyPath, value] of Object.entries(translated)) {
    setNestedValue(result, keyPath, value);
  }

  return result;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Auto-Translate: de.json → alle Sprachen         ║');
  console.log('╚══════════════════════════════════════════════════╝');

  if (!fs.existsSync(MESSAGES_DIR)) {
    fs.mkdirSync(MESSAGES_DIR, { recursive: true });
  }

  const sourceRaw = fs.readFileSync(SOURCE_FILE, 'utf-8');
  const sourceObj = JSON.parse(sourceRaw) as Record<string, unknown>;

  const args = process.argv.slice(2);
  const targetLocales = args.length > 0
    ? Object.fromEntries(args.map(l => [l, LOCALES[l]]).filter(([, v]) => v))
    : LOCALES;

  if (Object.keys(targetLocales).length === 0) {
    console.error('❌ Ungültige Locale angegeben. Verfügbar:', Object.keys(LOCALES).join(', '));
    process.exit(1);
  }

  console.log(`\n📝 Übersetze ${Object.keys(targetLocales).length} Sprachen...`);
  console.log('   Quelle: messages/de.json');
  console.log('   Ziele:', Object.keys(targetLocales).join(', '));

  for (const [locale, language] of Object.entries(targetLocales)) {
    try {
      const translated = await translateLocale(sourceObj, locale, language);
      const outPath = path.join(MESSAGES_DIR, `${locale}.json`);
      fs.writeFileSync(outPath, JSON.stringify(translated, null, 2), 'utf-8');
      console.log(`\n   ✅ messages/${locale}.json geschrieben`);
    } catch (err) {
      console.error(`\n   ❌ Fehler bei ${locale}:`, err);
    }
  }

  console.log('\n\n🎉 Fertig! Alle Sprachdateien generiert.');
  console.log('\n💡 Tipp: Bei Änderungen in de.json einfach erneut ausführen:');
  console.log('   npx ts-node --transpile-only scripts/translate.ts');
  console.log('   npx ts-node --transpile-only scripts/translate.ts en es  # nur bestimmte');
}

main().catch(console.error);