import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  onSnapshotsInSync,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without passing firestoreDatabaseId.
// Real-time multi-device synchronization:
//  - persistentLocalCache + persistentMultipleTabManager enables an on-disk write
//    queue so edits made offline are cached and automatically flushed to the server
//    (and to every other device) as soon as connectivity returns. The multi-tab
//    manager keeps every open tab on the same device consistent too.
//  - Falls back to the in-memory cache for environments without IndexedDB
//    (private browsing on some browsers) so the app never hard-fails.
function createFirestore() {
  try {
    return initializeFirestore(
      app,
      {
        // Tolerate optional fields that are `undefined` (e.g. question formats
        // that only populate a subset of properties) instead of rejecting the
        // whole write, which would leave a collection partially populated.
        ignoreUndefinedProperties: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch (error) {
    console.warn(
      'Persistent Firestore cache unavailable, falling back to in-memory cache:',
      error
    );
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = createFirestore();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Re-exported so the app layer keeps a single import surface for Firestore APIs.
export { onSnapshotsInSync, runTransaction, serverTimestamp };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  // NOTE: intentionally does NOT throw. Previous implementation threw a new
  // Error on every failure, which turned every onSnapshot error callback and
  // every background write into an uncaught exception — writes appeared to
  // succeed locally (optimistic state) but never reached Firestore, so other
  // devices never saw examination sets or other updates in real time.
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test helper
export async function testFirestoreConnection(): Promise<boolean> {
  return getDocFromServer(doc(db, 'test', 'connection'))
    .then(() => {
      console.log('Firebase Firestore connection verified successfully.');
      return true;
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase client appears offline.');
      }
      return false;
    });
}
