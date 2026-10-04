// One-time (idempotent) cloud seeder.
//
// The app only seeds Firestore when the `users` collection is empty, so the
// course catalog, question bank, examinations and settings were never written
// on databases that already had the sample accounts. This script guarantees
// every collection the UI renders contains the canonical BSCpE seed data by
// writing only the documents whose ids are missing (non-destructive).
//
// Run with:  npx tsx scripts/seed-db.ts
import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_QUESTIONS,
  INITIAL_EXAMINATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
} from '../src/data/initialData';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  readFileSync(join(__dirname, '..', 'firebase-applet-config.json'), 'utf8')
);

const app = initializeApp(config);
// ignoreUndefinedProperties mirrors Firestore's tolerant write behaviour so
// optional question fields that are present-but-undefined never reject a write.
const db = initializeFirestore(
  app,
  { ignoreUndefinedProperties: true },
  config.firestoreDatabaseId
);

const BATCH_LIMIT = 450;

async function seedCollection(name: string, records: Array<{ id: string }>) {
  const snap = await getDocs(collection(db, name));
  const existing = new Set(snap.docs.map((d) => d.id));
  const missing = records.filter((r) => !existing.has(r.id));

  if (missing.length === 0) {
    console.log(`  ${name.padEnd(14)} -> up to date (${snap.size} docs)`);
    return;
  }

  for (let i = 0; i < missing.length; i += BATCH_LIMIT) {
    const chunk = missing.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);
    chunk.forEach((record) => batch.set(doc(db, name, record.id), record));
    await batch.commit();
  }
  console.log(
    `  ${name.padEnd(14)} -> wrote ${missing.length} missing doc(s) (now ${snap.size + missing.length})`
  );
}

(async () => {
  console.log(`Seeding project ${config.projectId}`);
  console.log(`  database      -> ${config.firestoreDatabaseId}`);
  await seedCollection('users', INITIAL_USERS);
  await seedCollection('courses', INITIAL_COURSES);
  await seedCollection('questions', INITIAL_QUESTIONS);
  await seedCollection('examinations', INITIAL_EXAMINATIONS);
  await seedCollection('audit_logs', INITIAL_AUDIT_LOGS);

  const settingsRef = doc(db, 'settings', 'global');
  const settingsSnap = await getDoc(settingsRef);
  if (settingsSnap.exists()) {
    console.log('  settings/global -> already present');
  } else {
    await setDoc(settingsRef, INITIAL_SETTINGS);
    console.log('  settings/global -> created');
  }

  console.log('Seeding complete.');
  process.exit(0);
})().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
