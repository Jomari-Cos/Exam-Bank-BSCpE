// Read-only diagnostic: reports how much data currently lives in the shared
// Firestore database so we can confirm whether every collection the UI renders
// has been seeded (and therefore will display without errors).
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  readFileSync(join(__dirname, '..', 'firebase-applet-config.json'), 'utf8')
);

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

// Hard watchdog so a stalled network request can never hang the run.
const watchdog = setTimeout(() => {
  console.error('Timed out after 30s waiting for Firestore.');
  process.exit(2);
}, 30_000);
watchdog.unref?.();

const COLLECTIONS = [
  'users',
  'courses',
  'questions',
  'examinations',
  'audit_logs',
  'presence',
];

(async () => {
  console.log(`Project: ${config.projectId}`);
  console.log(`Firestore DB: ${config.firestoreDatabaseId}`);
  for (const name of COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, name));
      console.log(`  ${name.padEnd(14)} -> ${snap.size} document(s)`);
    } catch (e) {
      console.log(`  ${name.padEnd(14)} -> ERROR: ${e && e.message ? e.message : e}`);
    }
  }
  try {
    const settings = await getDoc(doc(db, 'settings', 'global'));
    console.log(`  settings/global -> ${settings.exists() ? 'present' : 'MISSING'}`);
  } catch (e) {
    console.log(`  settings/global -> ERROR: ${e && e.message ? e.message : e}`);
  }
  process.exit(0);
})().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
