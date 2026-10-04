import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Course,
  Question,
  AuditLog,
  SystemSettings,
  Examination,
  Role,
  QuestionStatus,
  PresenceEntry,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_QUESTIONS,
  INITIAL_EXAMINATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import {
  db,
  auth,
  googleProvider,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  DEFAULT_VIEW,
  buildHashRoute,
  isViewAllowedForRole,
  parseHashRoute,
  type RouteSelection,
} from '../lib/navigation';
import {
  collection,
  doc,
  onSnapshot,
  onSnapshotsInSync,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously,
} from 'firebase/auth';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  authUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loginAsUser: (user: User) => void;
  loginWithCredentials: (
    identifier: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isFirebaseConnected: boolean;
  isLoadingData: boolean;

  // Real-time multi-device synchronization status
  isSyncing: boolean;
  lastSyncedAt: number | null;
  onlineUsers: PresenceEntry[];
  syncNotice: SyncNotice | null;
  dismissSyncNotice: () => void;

  users: User[];
  addUser: (userData: Omit<User, 'id' | 'avatarInitials'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  saveSampleAccountsToFirebase: () => Promise<boolean>;

  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addTopicToCourse: (courseId: string, topic: string) => Promise<void>;
  removeTopicFromCourse: (courseId: string, topic: string) => Promise<void>;

  questions: Question[];
  createQuestion: (questionData: Partial<Question>) => Promise<Question>;
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<void>;
  forceUpdateQuestion: (id: string, updates: Partial<Question>) => Promise<void>;
  duplicateQuestion: (id: string) => Promise<Question>;
  archiveQuestion: (id: string) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  submitQuestionForReview: (id: string, note?: string) => Promise<void>;
  reviewQuestion: (
    id: string,
    action: 'Approved' | 'Rejected' | 'Returned',
    comments: string,
    criteriaChecks?: any
  ) => Promise<void>;

  examinations: Examination[];
  createExamination: (examData: Examination) => Promise<void>;
  updateExamination: (id: string, updates: Partial<Examination>) => Promise<void>;
  deleteExamination: (id: string) => Promise<void>;

  auditLogs: AuditLog[];
  logAudit: (
    action: string,
    targetType: AuditLog['targetType'],
    details: string,
    targetId?: string
  ) => Promise<void>;

  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;

  currentView: string;
  setCurrentView: (view: string, selection?: RouteSelection) => void;
  navigate: (view: string, selection?: RouteSelection) => void;
  sessionRestored: boolean;
  editingQuestionId: string | null;
  setEditingQuestionId: (id: string | null) => void;
  viewingQuestionId: string | null;
  setViewingQuestionId: (id: string | null) => void;
  viewingExamId: string | null;
  setViewingExamId: (id: string | null) => void;

  resetDatabaseToDefaults: () => Promise<void>;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => Promise<boolean>;
}

/** A transient, user-facing banner describing a cross-device sync event or conflict. */
export interface SyncNotice {
  id: string;
  kind: 'info' | 'warning';
  message: string;
  /** When present, renders a one-click "Keep My Version" action to resolve a conflict. */
  conflictQuestionId?: string;
}

// Stable per-tab session id so presence/conflict handling can distinguish devices.
const SESSION_STORAGE_KEY = 'bscpe_sync_session_id';
const AUTH_SESSION_KEY = 'bscpe_authenticated_session';
const AUTH_USER_KEY = 'bscpe_authenticated_user_id';
// Full signed-in profile cached synchronously. The id alone is not enough on
// reload: directory lookup is async, and starting from INITIAL_USERS[0] would
// briefly (or permanently, for profiles absent from the seed list) render as
// the default administrator.
const AUTH_USER_SNAPSHOT_KEY = 'bscpe_authenticated_user_snapshot';
// Last visited app view, so a reload without a URL hash can still land back
// on the exact page (e.g. users list) instead of the dashboard.
const LAST_VIEW_SNAPSHOT_KEY = 'bscpe_last_view_snapshot';

interface StoredViewSnapshot {
  view: string;
  editingQuestionId: string | null;
  viewingExamId: string | null;
}

/** Best-effort read of the cached signed-in profile (null when absent). */
function readStoredUserSnapshot(): User | null {
  try {
    const raw = sessionStorage.getItem(AUTH_USER_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (!parsed || typeof parsed.id !== 'string' || typeof parsed.role !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Last view saved before unload / on navigation (null when absent). */
function readStoredViewSnapshot(): StoredViewSnapshot | null {
  try {
    const raw = sessionStorage.getItem(LAST_VIEW_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredViewSnapshot;
    if (!parsed || typeof parsed.view !== 'string' || !parsed.view) return null;
    return {
      view: parsed.view,
      editingQuestionId: parsed.editingQuestionId ?? null,
      viewingExamId: parsed.viewingExamId ?? null,
    };
  } catch {
    return null;
  }
}

/** Initial route: URL hash wins; otherwise the last visited page snapshot. */
function readInitialRoute(): StoredViewSnapshot {
  if (typeof window !== 'undefined' && window.location.hash) {
    const route = parseHashRoute(window.location.hash);
    // An empty hash normalizes to the dashboard — prefer the saved page.
    if (window.location.hash.replace(/^#\/?/, '').trim().length > 0) {
      return route;
    }
    const saved = readStoredViewSnapshot();
    if (saved) return saved;
    return route;
  }
  const saved = readStoredViewSnapshot();
  if (saved) return saved;
  return { view: DEFAULT_VIEW, editingQuestionId: null, viewingExamId: null };
}
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = `sess-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

// Human-readable label describing the current device/OS/browser for the presence roster.
function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  const os = /Windows/i.test(ua)
    ? 'Windows'
    : /Macintosh|Mac OS X/i.test(ua)
    ? 'macOS'
    : /Android/i.test(ua)
    ? 'Android'
    : /iPhone|iPad|iPod/i.test(ua)
    ? 'iOS'
    : /Linux/i.test(ua)
    ? 'Linux'
    : 'Unknown OS';
  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /OPR\//i.test(ua)
    ? 'Opera'
    : /Chrome\//i.test(ua)
    ? 'Chrome'
    : /Firefox\//i.test(ua)
    ? 'Firefox'
    : /Safari\//i.test(ua)
    ? 'Safari'
    : 'Browser';
  return `${browser} on ${os}`;
}

const PRESENCE_HEARTBEAT_MS = 20_000;
// A session is considered online if it checked in within this window.
const PRESENCE_STALE_MS = 60_000;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [examinations, setExaminations] = useState<Examination[]>(INITIAL_EXAMINATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(INITIAL_SETTINGS);

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    // Restore the exact signed-in profile synchronously so the very first
    // render already carries the correct role — never the default admin.
    if (sessionStorage.getItem(AUTH_SESSION_KEY) === 'true') {
      return readStoredUserSnapshot() ?? INITIAL_USERS[0];
    }
    return INITIAL_USERS[0];
  });
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Explicitly start at Login page unless this browser session has authenticated
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  });
  // Blocks rendering until the signed-in account is resolved. Without this a
  // reload briefly renders with the default administrator (`INITIAL_USERS[0]`).
  const [sessionRestored, setSessionRestored] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_SESSION_KEY) !== 'true';
  });
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(
    () => (typeof navigator === 'undefined' ? true : navigator.onLine)
  );
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Real-time multi-device sync status
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<PresenceEntry[]>([]);
  const [syncNotice, setSyncNotice] = useState<SyncNotice | null>(null);

  // Signals from the local device's own writes vs. remote snapshot arrivals.
  const localWriteRef = React.useRef<number>(0);
  // Tracks whether the Firestore user directory has delivered at least once,
  // so session restore can wait for it instead of misreading "not loaded yet"
  // as "account deleted".
  const usersHydratedRef = React.useRef<boolean>(false);
  const sessionIdRef = React.useRef<string>(getSessionId());
  // Set once the `presence` collection reports a permission failure (e.g. the
  // Firestore `presence` rule has not been deployed yet). Once flagged, further
  // presence reads/writes are skipped so the online-user roster degrades quietly
  // instead of spamming permission errors — core data sync is unaffected.
  const presenceUnavailableRef = React.useRef<boolean>(false);
  const handlePresenceError = (error: unknown) => {
    if (presenceUnavailableRef.current) return;
    presenceUnavailableRef.current = true;
    console.info(
      'Online-user presence is unavailable (Firestore `presence` rule not deployed). ' +
        'Real-time data synchronization continues normally.',
      error
    );
  };

  // Mark that this device just performed a local write. This (a) puts the UI
  // into a brief "syncing" state and (b) lets snapshot handlers tell our own
  // echo apart from genuine remote changes from another user/device.
  const markLocalWrite = () => {
    localWriteRef.current = Date.now();
    setIsSyncing(true);
  };

  const markSynced = (hasPendingWrites: boolean) => {
    setIsSyncing(hasPendingWrites);
    if (!hasPendingWrites) setLastSyncedAt(Date.now());
  };

  const dismissSyncNotice = () => setSyncNotice(null);

  // Surface a transient banner; auto-dismiss informational notices after a while.
  const pushSyncNotice = (notice: Omit<SyncNotice, 'id'>, autoDismissMs?: number) => {
    const full: SyncNotice = { ...notice, id: `notice-${Date.now()}-${Math.random()}` };
    setSyncNotice(full);
    if (autoDismissMs) {
      setTimeout(() => {
        setSyncNotice((current) => (current && current.id === full.id ? null : current));
      }, autoDismissMs);
    }
  };

  // Navigation states. The active view is mirrored to the URL hash so a
  // browser reload restores the exact page instead of the dashboard.
  // Falls back to the last-visited snapshot when the URL has no hash
  // (e.g. a refresh that dropped it), so reloads never reset to ADMIN.
  const [currentView, setCurrentViewState] = useState<string>(() => readInitialRoute().view);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    () => readInitialRoute().editingQuestionId
  );
  const [viewingQuestionId, setViewingQuestionId] = useState<string | null>(null);
  const [viewingExamId, setViewingExamId] = useState<string | null>(
    () => readInitialRoute().viewingExamId
  );

  const persistViewSnapshot = (view: string, selection: RouteSelection = {}) => {
    try {
      const snapshot: StoredViewSnapshot = {
        view,
        editingQuestionId: selection.editingQuestionId ?? null,
        viewingExamId: selection.viewingExamId ?? null,
      };
      sessionStorage.setItem(LAST_VIEW_SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch {
      // Non-fatal: hash routing still preserves the page for this session.
    }
  };

  const writeHashRoute = (view: string, selection: RouteSelection = {}) => {
    const nextHash = buildHashRoute(view, selection);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    persistViewSnapshot(view, selection);
  };

  const setCurrentView = (view: string, selection: RouteSelection = {}) => {
    const route = parseHashRoute(buildHashRoute(view, selection));
    setCurrentViewState(route.view);
    // Always sync companion ids from the route (null when leaving those
    // views) so in-memory state can never go stale relative to the URL.
    setEditingQuestionId(route.editingQuestionId);
    setViewingExamId(route.viewingExamId);
    writeHashRoute(route.view, {
      editingQuestionId: route.editingQuestionId,
      viewingExamId: route.viewingExamId,
    });
  };

  const navigate = (view: string, selection: RouteSelection = {}) => {
    setCurrentView(view, selection);
  };

  // Browser back/forward buttons and manually edited URLs flow through here.
  // Every confirmed route is also mirrored to the snapshot so a hash-less
  // reload restores the same page instead of the dashboard.
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHashRoute(window.location.hash);
      setCurrentViewState(route.view);
      setEditingQuestionId(route.editingQuestionId);
      setViewingExamId(route.viewingExamId);
      persistViewSnapshot(route.view, {
        editingQuestionId: route.editingQuestionId,
        viewingExamId: route.viewingExamId,
      });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // On first mount, commit the resolved initial route (hash or last-visited
  // snapshot) to the URL + snapshot so a later reload has something to read
  // even if no navigation happened in this session.
  useEffect(() => {
    if (!isAuthenticated) return;
    const route = readInitialRoute();
    if (!isViewAllowedForRole(route.view, currentUser.role)) return;
    writeHashRoute(route.view, {
      editingQuestionId: route.editingQuestionId,
      viewingExamId: route.viewingExamId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL route compatible with the restored account so a signed-in
  // user never lands on (or can keep) a page their role cannot access.
  useEffect(() => {
    if (!isAuthenticated || !sessionRestored) return;
    if (isViewAllowedForRole(currentView, currentUser.role)) return;
    setCurrentViewState(DEFAULT_VIEW);
    setEditingQuestionId(null);
    setViewingExamId(null);
    writeHashRoute(DEFAULT_VIEW, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, sessionRestored, currentView, currentUser.role]);

  const persistAuthenticatedUser = (user: User) => {
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    sessionStorage.setItem(AUTH_USER_KEY, user.id);
    try {
      sessionStorage.setItem(AUTH_USER_SNAPSHOT_KEY, JSON.stringify(user));
    } catch {
      // Storage full/blocked — the id lookup below still restores the session.
    }
  };

  // 1. Initialize Firebase Auth, then keep connection status live
  useEffect(() => {
    // Verify the Firestore connection once, then rely on live signals below.
    testFirestoreConnection().then((connected) => setIsFirebaseConnected(connected));

    // Firestore notifies us whenever all local writes have been acknowledged by
    // the server (i.e. every device is now consistent) — refresh "last synced".
    const unsubInSync = onSnapshotsInSync(db, () => {
      setIsFirebaseConnected(true);
      setLastSyncedAt(Date.now());
    });

    // Browser-level connectivity: react immediately to network changes.
    const handleOnline = () => {
      testFirestoreConnection().then((connected) => setIsFirebaseConnected(connected));
    };
    const handleOffline = () => setIsFirebaseConnected(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      // Only auto-restore authentication flag if a session is active.
      // NOTE: We intentionally do NOT call persistAuthenticatedUser or
      // setCurrentUserState here on reload, because this effect captures
      // `users` from a stale empty-array closure ([] dependency). Any attempt
      // to look up the user in `users` here would always fail on reload.
      // The session restore effect (below) runs once `users` loads from
      // Firestore and correctly finds + restores the account via AUTH_USER_KEY.
      const hasActiveSession = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
      if (user && hasActiveSession) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      unsubInSync();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeAuth();
    };
  }, []);

  // 2. Real-time sync with Firestore & Initial Cloud Seeding
  useEffect(() => {
    let isSubscribed = true;

    // Guarantees Firestore writes are allowed before seeding / subscribing.
    // Username-password logins have no Firebase Auth user, so most locked-down
    // rules reject writes. An anonymous session satisfies `request.auth != null`
    // without changing the app's own role/login system.
    const ensureFirestoreAuth = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn('Anonymous Firestore auth unavailable:', err);
      }
    };

    // Seed helper: guarantees every collection the UI renders actually has its
    // sample records. Each collection is checked independently (rather than
    // only when `users` is empty), so a database seeded before the course
    // catalog / question bank / examinations / settings existed — or one whose
    // collections were emptied — self-heals on the next load instead of
    // rendering empty lists. A collection is only re-seeded when it is
    // completely empty, so individually deleted or archived records are never
    // resurrected.
    const seedInitialDataIfEmpty = async () => {
      try {
        const seedCollection = async (
          name: string,
          records: Array<{ id: string }>
        ) => {
          const snapshot = await getDocs(collection(db, name));
          if (!snapshot.empty) return;
          console.log(`Seeding ${records.length} ${name} records into Firebase Firestore...`);
          const batch = writeBatch(db);
          records.forEach((record) => batch.set(doc(db, name, record.id), record));
          await batch.commit();
        };

        await seedCollection('users', INITIAL_USERS);
        await seedCollection('courses', INITIAL_COURSES);
        await seedCollection('questions', INITIAL_QUESTIONS);
        await seedCollection('examinations', INITIAL_EXAMINATIONS);
        await seedCollection('audit_logs', INITIAL_AUDIT_LOGS);

        // Settings live in a single named document (not a collection).
        const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
        if (!settingsSnap.exists()) {
          console.log('Seeding default system settings into Firebase Firestore...');
          await setDoc(doc(db, 'settings', 'global'), INITIAL_SETTINGS);
        }

        console.log('Firebase Firestore seeding check complete.');
      } catch (err) {
        console.warn('Initial seeding note:', err);
      }
    };

    // Anonymous auth must finish first so the initial seeding writes (and
    // every later create/update/delete on examinations, questions, courses,
    // users…) are accepted by Firestore security rules. Without this, writes
    // fail with permission-denied, state only changes locally, and other users
    // never receive the examination sets in real time.
    ensureFirestoreAuth().then(() => {
      if (isSubscribed) seedInitialDataIfEmpty();
    });

    // A short grace window after a local write, used to tell our own changes
    // apart from changes made on another device.
    const recentlyWroteLocally = () => Date.now() - localWriteRef.current < 3000;
    const announceRemoteChange = (label: string) => {
      if (!isSubscribed) return;
      if (recentlyWroteLocally()) return;
      pushSyncNotice({ kind: 'info', message: `Updated from another device — ${label}` }, 5000);
    };

    // Attach real-time snapshot listeners.
    // NOTE: We intentionally apply *every* snapshot — including empty ones — so
    // that deletions performed on another device propagate here instead of the
    // stale rows lingering forever. The authoritative id is always `d.id`.
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const loaded: User[] = snapshot.docs.map((d) => ({ ...(d.data() as User), id: d.id }));
        usersHydratedRef.current = true;
        setUsers(loaded);
        markSynced(snapshot.metadata.hasPendingWrites);
        if (!snapshot.metadata.fromCache) announceRemoteChange('user directory changed');
      },
      (error) => {
        usersHydratedRef.current = true;
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );

    const unsubCourses = onSnapshot(
      collection(db, 'courses'),
      (snapshot) => {
        const loaded: Course[] = snapshot.docs.map((d) => ({ ...(d.data() as Course), id: d.id }));
        setCourses(loaded);
        markSynced(snapshot.metadata.hasPendingWrites);
        if (!snapshot.metadata.fromCache) announceRemoteChange('course catalog changed');
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'courses')
    );

    const unsubQuestions = onSnapshot(
      collection(db, 'questions'),
      (snapshot) => {
        const loaded: Question[] = snapshot.docs.map((d) => ({ ...(d.data() as Question), id: d.id }));
        setQuestions(loaded);
        setIsLoadingData(false);
        markSynced(snapshot.metadata.hasPendingWrites);
        if (!snapshot.metadata.fromCache) announceRemoteChange('question bank changed');
      },
      (error) => {
        setIsLoadingData(false);
        handleFirestoreError(error, OperationType.GET, 'questions');
      }
    );

    const unsubExams = onSnapshot(
      collection(db, 'examinations'),
      (snapshot) => {
        const loaded: Examination[] = snapshot.docs.map((d) => ({
          ...(d.data() as Examination),
          id: d.id,
        }));
        setExaminations(loaded);
        markSynced(snapshot.metadata.hasPendingWrites);
        if (!snapshot.metadata.fromCache) announceRemoteChange('examination sets changed');
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'examinations')
    );

    const unsubLogs = onSnapshot(
      collection(db, 'audit_logs'),
      (snapshot) => {
        const loaded: AuditLog[] = snapshot.docs.map((d) => ({ ...(d.data() as AuditLog), id: d.id }));
        setAuditLogs(loaded.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
        markSynced(snapshot.metadata.hasPendingWrites);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'audit_logs')
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (snapshot) => {
        if (snapshot.exists()) {
          setSystemSettings({ ...(snapshot.data() as SystemSettings) });
          markSynced(snapshot.metadata.hasPendingWrites);
          if (!snapshot.metadata.fromCache) announceRemoteChange('system settings changed');
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'settings/global')
    );

    // Presence roster: keep only sessions that checked in within the stale window.
    const unsubPresence = onSnapshot(
      collection(db, 'presence'),
      (snapshot) => {
        const now = Date.now();
        const active: PresenceEntry[] = snapshot.docs
          .map((d) => ({ ...(d.data() as PresenceEntry), id: d.id }))
          .filter((p) => now - (p.lastSeen || 0) < PRESENCE_STALE_MS);
        setOnlineUsers(active);
      },
      (error) => handlePresenceError(error)
    );

    return () => {
      isSubscribed = false;
      unsubUsers();
      unsubCourses();
      unsubQuestions();
      unsubExams();
      unsubLogs();
      unsubSettings();
      unsubPresence();
    };
  }, []);

  // 3. Presence: publish this device's heartbeat so other devices can see it online.
  useEffect(() => {
    if (!isAuthenticated || !authUser) return;

    const presenceRef = doc(db, 'presence', sessionIdRef.current);
    const entry: PresenceEntry = {
      id: sessionIdRef.current,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      device: getDeviceLabel(),
      lastSeen: Date.now(),
    };

    const publish = () => {
      if (presenceUnavailableRef.current) return;
      setDoc(presenceRef, { ...entry, lastSeen: Date.now() }).catch(handlePresenceError);
    };

    publish();
    const heartbeat = window.setInterval(publish, PRESENCE_HEARTBEAT_MS);

    // Best-effort cleanup so a device disappears promptly when it leaves.
    const retract = () => {
      deleteDoc(presenceRef).catch(() => {
        /* the stale-window filter will hide it anyway */
      });
    };
    window.addEventListener('pagehide', retract);
    window.addEventListener('beforeunload', retract);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener('pagehide', retract);
      window.removeEventListener('beforeunload', retract);
      retract();
    };
  }, [isAuthenticated, authUser, currentUser.id, currentUser.name, currentUser.role]);

  // Restores the signed-in account after a browser reload. This intentionally
  // runs for every auth path (username/password quick login has no Firebase
  // auth user), so reloads never fall through to the default administrator.
  useEffect(() => {
    if (sessionRestored || !isAuthenticated) return;

    const storedUserId = sessionStorage.getItem(AUTH_USER_KEY);
    if (!storedUserId) {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_USER_SNAPSHOT_KEY);
      localStorage.removeItem('bscpe_authenticated_v1');
      localStorage.removeItem('bscpe_current_user_v1');
      setIsAuthenticated(false);
      setSessionRestored(true);
      return;
    }

    // Wait until the Firestore user directory has delivered at least once.
    // Treating "not loaded yet" as "account deleted" is exactly what used to
    // sign users out / fall back to admin on reload.
    if (!usersHydratedRef.current && users.length === 0) return;

    const restoredUser = users.find((user) => user.id === storedUserId);
    if (!restoredUser) {
      if (!usersHydratedRef.current) return;
      // Directory loaded but doesn't know this profile (e.g. a Google account
      // never seeded into `users`). Keep the cached snapshot so the session
      // — and role-gated page — survives the reload instead of resetting.
      const snapshot = readStoredUserSnapshot();
      if (snapshot && snapshot.id === storedUserId) {
        setCurrentUserState(snapshot);
        setSessionRestored(true);
        return;
      }
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.removeItem(AUTH_USER_SNAPSHOT_KEY);
      localStorage.removeItem('bscpe_authenticated_v1');
      localStorage.removeItem('bscpe_current_user_v1');
      setIsAuthenticated(false);
      setSessionRestored(true);
      return;
    }
    if (!restoredUser.active) {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.removeItem(AUTH_USER_SNAPSHOT_KEY);
      localStorage.removeItem('bscpe_authenticated_v1');
      localStorage.removeItem('bscpe_current_user_v1');
      setIsAuthenticated(false);
      setSessionRestored(true);
      return;
    }

    setCurrentUserState(restoredUser);
    // Keep the synchronous snapshot fresh so the *next* reload starts with
    // the latest role/profile even before Firestore delivers.
    try {
      sessionStorage.setItem(AUTH_USER_SNAPSHOT_KEY, JSON.stringify(restoredUser));
    } catch {
      // Non-fatal: restore still succeeded via the live directory lookup.
    }
    setSessionRestored(true);
  }, [sessionRestored, isAuthenticated, users]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Resolve the directory account now so the correct role (not the
        // default administrator) is used before the auth listener runs.
        const directoryUser = users.find(
          (u) => u.email.toLowerCase() === result.user.email?.toLowerCase()
        );
        const fallbackUser: User = {
          id: result.user.uid,
          name: result.user.displayName || 'Authorized Faculty',
          email: result.user.email || '',
          role: result.user.email === 'jcos83531@gmail.com' ? 'admin' : 'faculty',
          department: 'Computer Engineering Department',
          title: result.user.email === 'jcos83531@gmail.com' ? 'Administrator' : 'Faculty Member',
          active: true,
          avatarInitials: (result.user.displayName || result.user.email || 'AF')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase(),
        };
        persistAuthenticatedUser(directoryUser ?? fallbackUser);
        setCurrentUserState(directoryUser ?? fallbackUser);
        setSessionRestored(true);
        setIsAuthenticated(true);
        setCurrentView('dashboard');
        await logAudit(
          'Google Authentication',
          'User',
          `Authenticated with institutional Google ID ${result.user.email}`
        );
      }
    } catch (error) {
      console.error('Google Sign In failed:', error);
      alert('Authentication error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const loginAsUser = (user: User) => {
    persistAuthenticatedUser(user);
    setSessionRestored(true);
    setCurrentUserState(user);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    logAudit('User Signed In', 'User', `User ${user.name} logged into ${user.role} workspace`, user.id);
  };

  const loginWithCredentials = async (
    identifier: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter both username/email and password.' };
    }

    // Try finding the user in the database (loaded from Firestore or defaults)
    const matchedUser = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.username && u.username.toLowerCase() === cleanId)
    );

    if (!matchedUser) {
      return { success: false, error: 'Account not found. Please check your username or institutional email.' };
    }

    if (!matchedUser.active) {
      return {
        success: false,
        error: 'This account has been deactivated by the Administrator.',
      };
    }

    // Verify password (matches user.password, or default fallback)
    const expectedPass = matchedUser.password || 'admin123';
    if (cleanPass !== expectedPass) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    // Success! Log the user in
    persistAuthenticatedUser(matchedUser);
    setSessionRestored(true);
    setCurrentUserState(matchedUser);
    setIsAuthenticated(true);
    setCurrentView('dashboard');

    await logAudit(
      'User Authenticated',
      'User',
      `User ${matchedUser.name} (${matchedUser.email}) authenticated with username/password`,
      matchedUser.id
    );

    return { success: true };
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
    setAuthUser(null);
    setIsAuthenticated(false);
    setSessionRestored(true);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_SNAPSHOT_KEY);
    sessionStorage.removeItem(LAST_VIEW_SNAPSHOT_KEY);
    localStorage.removeItem('bscpe_authenticated_v1');
    localStorage.removeItem('bscpe_current_user_v1');
    setCurrentView('dashboard');
    await logAudit('User Signed Out', 'User', `User ${currentUser.name} signed out of session`);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setCurrentView('dashboard');
    setEditingQuestionId(null);
    setViewingQuestionId(null);
    setViewingExamId(null);
  };

  const logAudit = async (
    action: string,
    targetType: AuditLog['targetType'],
    details: string,
    targetId?: string
  ) => {
    const newId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newLog: AuditLog = {
      id: newId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      targetType,
      targetId: targetId || '',
      details,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'audit_logs', newId), newLog);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `audit_logs/${newId}`);
    }
  };

  // User Management
  const addUser = async (userData: Omit<User, 'id' | 'avatarInitials'>) => {
    const initials = userData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    const newId = `usr-${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: newId,
      avatarInitials: initials,
    };

    markLocalWrite();
    setUsers((prev) => [...prev, newUser]);

    try {
      await setDoc(doc(db, 'users', newId), newUser);
      await logAudit(
        'User Created',
        'User',
        `Created user account for ${newUser.name} (${newUser.role})`,
        newUser.id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${newId}`);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    markLocalWrite();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser.id === id) {
            setCurrentUserState(updated);
          }
          return updated;
        }
        return u;
      })
    );

    try {
      await updateDoc(doc(db, 'users', id), updates);
      await logAudit('User Updated', 'User', `Updated user information for user ID ${id}`, id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  };

  const toggleUserStatus = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const newActive = !target.active;

    markLocalWrite();
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: newActive } : u))
    );

    try {
      await updateDoc(doc(db, 'users', id), { active: newActive });
      await logAudit(
        'User Status Toggled',
        'User',
        `Changed status to ${newActive ? 'Active' : 'Inactive'} for ${target.name}`,
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  };

  const deleteUser = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    markLocalWrite();
    setUsers((prev) => prev.filter((u) => u.id !== id));

    try {
      await deleteDoc(doc(db, 'users', id));
      await logAudit(
        'User Deleted',
        'User',
        `Deleted user account for ${target.name} (${target.email})`,
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
  };

  const saveSampleAccountsToFirebase = async (): Promise<boolean> => {
    try {
      const batch = writeBatch(db);
      INITIAL_USERS.forEach((u) => {
        batch.set(doc(db, 'users', u.id), u);
      });
      await batch.commit();

      // Also refresh local state with all initial users
      setUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        const added = INITIAL_USERS.filter((u) => !existingIds.has(u.id));
        return [...prev, ...added];
      });

      await logAudit(
        'Sample Accounts Saved',
        'User',
        `Successfully saved all ${INITIAL_USERS.length} sample personnel accounts into Firebase Firestore`
      );
      return true;
    } catch (error) {
      console.error('Failed to save sample accounts:', error);
      handleFirestoreError(error, OperationType.WRITE, 'users');
      return false;
    }
  };

  // Course Management
  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    const newId = `crs-${Date.now()}`;
    const newCourse: Course = {
      ...courseData,
      id: newId,
    };

    markLocalWrite();
    setCourses((prev) => [...prev, newCourse]);

    try {
      await setDoc(doc(db, 'courses', newId), newCourse);
      await logAudit(
        'Course Created',
        'Course',
        `Added new course ${newCourse.code}: ${newCourse.name}`,
        newCourse.id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `courses/${newId}`);
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    markLocalWrite();
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    try {
      await updateDoc(doc(db, 'courses', id), updates);
      await logAudit('Course Updated', 'Course', `Updated course details for ${id}`, id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `courses/${id}`);
    }
  };

  const deleteCourse = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    markLocalWrite();
    setCourses((prev) => prev.filter((c) => c.id !== id));

    try {
      await deleteDoc(doc(db, 'courses', id));
      await logAudit(
        'Course Deleted',
        'Course',
        `Deleted course ${course?.code || id}`,
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${id}`);
    }
  };

  const addTopicToCourse = async (courseId: string, topic: string) => {
    if (!topic.trim()) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course || course.topics.includes(topic.trim())) return;

    const newTopics = [...course.topics, topic.trim()];
    await updateCourse(courseId, { topics: newTopics });
  };

  const removeTopicFromCourse = async (courseId: string, topic: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const newTopics = course.topics.filter((t) => t !== topic);
    await updateCourse(courseId, { topics: newTopics });
  };

  // Question Management
  const createQuestion = async (questionData: Partial<Question>): Promise<Question> => {
    const newId = `Q-CPE-${systemSettings.academicYear.substring(0, 4)}-${String(
      questions.length + 1
    ).padStart(3, '0')}`;
    const now = new Date().toISOString().substring(0, 10);
    const newQuestion: Question = {
      id: newId,
      courseId: questionData.courseId || courses[0]?.id || '',
      courseCode: questionData.courseCode || courses[0]?.code || '',
      courseName: questionData.courseName || courses[0]?.name || '',
      topic: questionData.topic || courses[0]?.topics[0] || 'General',
      type: questionData.type || 'multiple_choice',
      question: questionData.question || '',
      difficulty: questionData.difficulty || 'Medium',
      learningOutcome: questionData.learningOutcome || 'CLO-1: Core Concept Analysis',
      points: questionData.points || 1,
      authorId: currentUser.id,
      authorName: currentUser.name,
      academicYear: systemSettings.academicYear,
      semester: systemSettings.currentSemester,
      status: (questionData.status as QuestionStatus) || 'Draft',
      dateCreated: now,
      dateModified: now,
      explanation: questionData.explanation || '',
      ...questionData,
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          userId: currentUser.id,
          userName: currentUser.name,
          action: `Created question as ${questionData.status || 'Draft'}`,
        },
      ],
    };

    markLocalWrite();
    setQuestions((prev) => [newQuestion, ...prev]);

    try {
      await setDoc(doc(db, 'questions', newId), newQuestion);
      try {
        await logAudit(
          'Question Created',
          'Question',
          `Created question ${newId} (${newQuestion.type}) for ${newQuestion.courseCode}`,
          newId
        );
      } catch (auditErr) {
        handleFirestoreError(auditErr, OperationType.WRITE, `audit_logs (question ${newId})`);
      }
    } catch (error) {
      // Re-throw so the caller (QuestionEditor) can show the save error
      // instead of navigating away as if the question reached the database.
      handleFirestoreError(error, OperationType.WRITE, `questions/${newId}`);
      throw error;
    }

    return newQuestion;
  };

  const updateQuestion = async (id: string, updates: Partial<Question>) => {
    const now = new Date().toISOString().substring(0, 10);
    const existingQ = questions.find((q) => q.id === id);
    if (!existingQ) return;

    const historyEntry = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'Updated question content/metadata',
    };

    const finalUpdates = {
      ...updates,
      dateModified: now,
      history: [...(existingQ.history || []), historyEntry],
    };

    markLocalWrite();
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...finalUpdates } : q))
    );

    try {
      await updateDoc(doc(db, 'questions', id), finalUpdates);
      try {
        await logAudit('Question Updated', 'Question', `Edited question ${id}`, id);
      } catch (auditErr) {
        handleFirestoreError(auditErr, OperationType.UPDATE, `questions/${id}`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `questions/${id}`);
      throw error;
    }
  };

  const forceUpdateQuestion = async (id: string, updates: Partial<Question>) => {
    // Bypasses the optimistic-concurrency guard (used by the conflict banner's
    // "Keep My Version" action): applies the update unconditionally with a
    // fresh revision so other devices converge on this version via onSnapshot.
    const existingQ = questions.find((q) => q.id === id);
    const now = new Date().toISOString().substring(0, 10);
    const finalUpdates = {
      ...updates,
      revision: (existingQ?.revision ?? 0) + 1,
      dateModified: now,
    };

    markLocalWrite();
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...finalUpdates } : q))
    );

    try {
      await updateDoc(doc(db, 'questions', id), finalUpdates);
      await logAudit('Question Force-Updated', 'Question', `Resolved sync conflict on ${id} (kept local version)`, id);
    } catch (error) {
      console.error(`Failed to force-update questions/${id}:`, error);
    }
  };

  const duplicateQuestion = async (id: string): Promise<Question> => {
    const source = questions.find((q) => q.id === id);
    if (!source) throw new Error('Question not found');
    const newId = `Q-CPE-${systemSettings.academicYear.substring(0, 4)}-${String(
      questions.length + 1
    ).padStart(3, '0')}`;
    const now = new Date().toISOString().substring(0, 10);

    const duplicated: Question = {
      ...source,
      id: newId,
      status: 'Draft',
      authorId: currentUser.id,
      authorName: currentUser.name,
      reviewerId: '',
      reviewerName: '',
      reviews: [],
      dateCreated: now,
      dateModified: now,
      question: `${source.question} (Copy)`,
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          userId: currentUser.id,
          userName: currentUser.name,
          action: `Cloned from ${source.id} as Draft`,
        },
      ],
    };

    markLocalWrite();
    setQuestions((prev) => [duplicated, ...prev]);

    try {
      await setDoc(doc(db, 'questions', newId), duplicated);
      await logAudit(
        'Question Duplicated',
        'Question',
        `Cloned question ${id} into new draft ${newId}`,
        newId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `questions/${newId}`);
    }

    return duplicated;
  };

  const archiveQuestion = async (id: string) => {
    const target = questions.find((q) => q.id === id);
    if (!target) return;

    const updates = {
      status: 'Archived' as QuestionStatus,
      history: [
        ...(target.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'Archived question',
        },
      ],
    };

    markLocalWrite();
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );

    try {
      await updateDoc(doc(db, 'questions', id), updates);
      await logAudit('Question Archived', 'Question', `Archived question ${id}`, id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `questions/${id}`);
    }
  };

  const deleteQuestion = async (id: string) => {
    markLocalWrite();
    setQuestions((prev) => prev.filter((q) => q.id !== id));

    try {
      await deleteDoc(doc(db, 'questions', id));
      await logAudit('Question Deleted', 'Question', `Deleted question ${id}`, id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `questions/${id}`);
    }
  };

  const submitQuestionForReview = async (id: string, note?: string) => {
    const target = questions.find((q) => q.id === id);
    if (!target) return;

    const updates = {
      status: 'Submitted' as QuestionStatus,
      history: [
        ...(target.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'Submitted for Committee Review',
          note: note || 'Ready for syllabus and answer verification',
        },
      ],
    };

    markLocalWrite();
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );

    try {
      await updateDoc(doc(db, 'questions', id), updates);
      await logAudit(
        'Question Submitted',
        'Question',
        `Submitted question ${id} for peer review`,
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `questions/${id}`);
    }
  };

  const reviewQuestion = async (
    id: string,
    action: 'Approved' | 'Rejected' | 'Returned',
    comments: string,
    criteriaChecks?: any
  ) => {
    const target = questions.find((q) => q.id === id);
    if (!target) return;

    const newStatus: QuestionStatus =
      action === 'Approved' ? 'Approved' : 'Draft';

    const feedback = {
      id: `rev-${Date.now()}`,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      date: new Date().toISOString().substring(0, 10),
      action,
      comments,
      criteriaChecks,
    };

    const updates = {
      status: newStatus,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviews: [...(target.reviews || []), feedback],
      history: [
        ...(target.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          userId: currentUser.id,
          userName: currentUser.name,
          action: `Review outcome: ${action}`,
          note: comments,
        },
      ],
    };

    markLocalWrite();
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );

    try {
      await updateDoc(doc(db, 'questions', id), updates);
      await logAudit(
        `Question ${action}`,
        'Question',
        `Reviewer ${currentUser.name} marked question ${id} as ${action}. Comments: "${comments}"`,
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `questions/${id}`);
    }
  };

  // Examination Management
  const createExamination = async (examData: Examination) => {
    markLocalWrite();
    setExaminations((prev) => [examData, ...prev]);

    try {
      await setDoc(doc(db, 'examinations', examData.id), examData);
      try {
        await logAudit(
          'Examination Generated',
          'Examination',
          `Generated examination "${examData.title}" (${examData.versions.length} versions, ${examData.questionCount} questions)`,
          examData.id
        );
      } catch (auditErr) {
        handleFirestoreError(auditErr, OperationType.WRITE, `audit_logs (exam ${examData.id})`);
      }
    } catch (error) {
      // Re-throw so the caller (ExamGenerator) can keep the user on the review
      // step and show the save error instead of navigating away as if the
      // package reached the shared database.
      handleFirestoreError(error, OperationType.WRITE, `examinations/${examData.id}`);
      throw error;
    }
  };

  const updateExamination = async (id: string, updates: Partial<Examination>) => {
    markLocalWrite();
    setExaminations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );

    try {
      await updateDoc(doc(db, 'examinations', id), updates);
      await logAudit('Examination Updated', 'Examination', `Updated examination set ${id}`, id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `examinations/${id}`);
    }
  };

  const deleteExamination = async (id: string) => {
    markLocalWrite();
    setExaminations((prev) => prev.filter((e) => e.id !== id));

    try {
      await deleteDoc(doc(db, 'examinations', id));
      await logAudit(
        'Examination Deleted',
        'Examination',
        `Deleted examination set ${id}`,
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `examinations/${id}`);
    }
  };

  const updateSystemSettings = async (settings: Partial<SystemSettings>) => {
    const updated = { ...systemSettings, ...settings };
    markLocalWrite();
    setSystemSettings(updated);

    try {
      await setDoc(doc(db, 'settings', 'global'), updated);
      await logAudit('System Settings Updated', 'Settings', 'Updated system preferences and terms');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  };

  // Reset & Backup
  const resetDatabaseToDefaults = async () => {
    setUsers(INITIAL_USERS);
    setCurrentUserState(INITIAL_USERS[0]);
    setCourses(INITIAL_COURSES);
    setQuestions(INITIAL_QUESTIONS);
    setExaminations(INITIAL_EXAMINATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSystemSettings(INITIAL_SETTINGS);

    try {
      const batch = writeBatch(db);
      INITIAL_USERS.forEach((u) => batch.set(doc(db, 'users', u.id), u));
      INITIAL_COURSES.forEach((c) => batch.set(doc(db, 'courses', c.id), c));
      INITIAL_QUESTIONS.forEach((q) => batch.set(doc(db, 'questions', q.id), q));
      INITIAL_EXAMINATIONS.forEach((e) => batch.set(doc(db, 'examinations', e.id), e));
      INITIAL_AUDIT_LOGS.forEach((l) => batch.set(doc(db, 'audit_logs', l.id), l));
      batch.set(doc(db, 'settings', 'global'), INITIAL_SETTINGS);
      await batch.commit();
      await logAudit('Database Reset', 'Settings', 'Reset all tables to initial factory default state');
    } catch (e) {
      console.error(e);
    }
  };

  const exportDatabaseJson = (): string => {
    const backup = {
      exportDate: new Date().toISOString(),
      system: 'BSCpE Examination Question Data Bank System',
      version: '1.0.0',
      data: {
        users,
        courses,
        questions,
        examinations,
        auditLogs,
        systemSettings,
      },
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDatabaseJson = async (jsonStr: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data) return false;
      const batch = writeBatch(db);

      if (parsed.data.users) {
        setUsers(parsed.data.users);
        parsed.data.users.forEach((u: User) => batch.set(doc(db, 'users', u.id), u));
      }
      if (parsed.data.courses) {
        setCourses(parsed.data.courses);
        parsed.data.courses.forEach((c: Course) => batch.set(doc(db, 'courses', c.id), c));
      }
      if (parsed.data.questions) {
        setQuestions(parsed.data.questions);
        parsed.data.questions.forEach((q: Question) => batch.set(doc(db, 'questions', q.id), q));
      }
      if (parsed.data.examinations) {
        setExaminations(parsed.data.examinations);
        parsed.data.examinations.forEach((e: Examination) => batch.set(doc(db, 'examinations', e.id), e));
      }
      if (parsed.data.auditLogs) {
        setAuditLogs(parsed.data.auditLogs);
        parsed.data.auditLogs.forEach((l: AuditLog) => batch.set(doc(db, 'audit_logs', l.id), l));
      }
      if (parsed.data.systemSettings) {
        setSystemSettings(parsed.data.systemSettings);
        batch.set(doc(db, 'settings', 'global'), parsed.data.systemSettings);
      }

      await batch.commit();
      await logAudit('Database Restored', 'Settings', 'Restored database from imported JSON package');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authUser,
        isAuthenticated,
        loginAsUser,
        loginWithCredentials,
        signInWithGoogle,
        signOut,
        isFirebaseConnected,
        isLoadingData,

        // Real-time sync status (Header / Sidebar badges + conflict banner)
        isSyncing,
        lastSyncedAt,
        onlineUsers,
        syncNotice,
        dismissSyncNotice,
        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        saveSampleAccountsToFirebase,
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        addTopicToCourse,
        removeTopicFromCourse,
        questions,
        createQuestion,
        updateQuestion,
        forceUpdateQuestion,
        duplicateQuestion,
        archiveQuestion,
        deleteQuestion,
        submitQuestionForReview,
        reviewQuestion,
        examinations,
        createExamination,
        updateExamination,
        deleteExamination,
        auditLogs,
        logAudit,
        systemSettings,
        updateSystemSettings,
        currentView,
        setCurrentView,
        navigate,
        sessionRestored,
        editingQuestionId,
        setEditingQuestionId,
        viewingQuestionId,
        setViewingQuestionId,
        viewingExamId,
        setViewingExamId,
        resetDatabaseToDefaults,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
