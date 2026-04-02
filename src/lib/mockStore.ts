// ── Central mock data store (replaces Supabase for local dev) ──────────────
import { Area, DistributionUser, WaterSchedule, SmsLog } from './supabase';

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now() {
  return new Date().toISOString();
}

// ── Seed data ─────────────────────────────────────────────────────────────
const seedAreas: Area[] = [
  { id: 'area-north', name: 'North Chennai', location: 'Minjur, TN', created_at: now(), updated_at: now() },
  { id: 'area-south', name: 'South Chennai', location: 'Navallur, TN', created_at: now(), updated_at: now() },
  { id: 'area-west', name: 'West Chennai', location: 'Porur, TN', created_at: now(), updated_at: now() },
];

// ── In-memory state ────────────────────────────────────────────────────────
const STORAGE_KEY = 'water_flow_mock_data';

interface StoreData {
  areas: Area[];
  users: DistributionUser[];
  schedules: WaterSchedule[];
  smsLogs: SmsLog[];
}

function load(): StoreData {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    areas: [...seedAreas],
    users: [],
    schedules: [],
    smsLogs: [],
  };
}

let { areas: _areas, users: _users, schedules: _schedules, smsLogs: _smsLogs } = load();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    areas: _areas,
    users: _users,
    schedules: _schedules,
    smsLogs: _smsLogs,
  }));
}

// Ensure all areas have a location field (migration)
_areas = _areas.map(a => ({ ...a, location: a.location || 'Unknown' }));
save();

// ── Areas ──────────────────────────────────────────────────────────────────
export const mockAreas = {
  getAll: (): Area[] => [..._areas].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  add: (name: string, location: string): Area => {
    const item: Area = { id: uuid(), name, location, created_at: now(), updated_at: now() };
    _areas = [item, ..._areas];
    save();
    return item;
  },
  update: (id: string, name: string, location: string) => {
    _areas = _areas.map(a => a.id === id ? { ...a, name, location, updated_at: now() } : a);
    save();
  },
  delete: (id: string) => {
    _areas = _areas.filter(a => a.id !== id);
    _users = _users.filter(u => u.area_id !== id); // Cleanup users in that area
    _schedules = _schedules.filter(s => s.area_id !== id); // Cleanup schedules
    save();
  },
};

// ── Users ──────────────────────────────────────────────────────────────────
export const mockUsers = {
  getAll: (): DistributionUser[] => [..._users].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  getByArea: (areaId: string): DistributionUser[] => _users.filter(u => u.area_id === areaId),
  count: (): number => _users.length,
  add: (name: string, phone: string, area_id: string): DistributionUser => {
    const item: DistributionUser = { id: uuid(), name, phone, area_id, created_at: now(), updated_at: now() };
    _users = [item, ..._users];
    save();
    return item;
  },
  update: (id: string, name: string, phone: string, area_id: string) => {
    _users = _users.map(u => u.id === id ? { ...u, name, phone, area_id, updated_at: now() } : u);
    save();
  },
  delete: (id: string) => {
    _users = _users.filter(u => u.id !== id);
    save();
  },
};

// ── Schedules ──────────────────────────────────────────────────────────────
export const mockSchedules = {
  getAll: (): WaterSchedule[] => [..._schedules].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  getByArea: (areaId: string): WaterSchedule | null =>
    _schedules.find(s => s.area_id === areaId && s.is_active) || null,
  set: (areaId: string, start_time: string, end_time: string): WaterSchedule => {
    _schedules = _schedules.filter(s => s.area_id !== areaId);
    const item: WaterSchedule = {
      id: uuid(), area_id: areaId, start_time, end_time,
      is_active: true, created_at: now(), updated_at: now(),
    };
    _schedules = [item, ..._schedules];
    save();
    return item;
  },
  deactivate: (id: string) => {
    _schedules = _schedules.map(s => s.id === id ? { ...s, is_active: false, updated_at: now() } : s);
    save();
  },
};

// ── SMS Logs ───────────────────────────────────────────────────────────────
export const mockSmsLogs = {
  getAll: (): SmsLog[] => [..._smsLogs].sort((a, b) => b.sent_at.localeCompare(a.sent_at)),
  getLimited: (limit = 10): SmsLog[] => mockSmsLogs.getAll().slice(0, limit),
  add: (log: Omit<SmsLog, 'id' | 'sent_at'>): SmsLog => {
    const item: SmsLog = { ...log, id: uuid(), sent_at: now() };
    _smsLogs = [item, ..._smsLogs];
    save();
    return item;
  },
  countToday: (status: 'sent' | 'failed'): number => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return _smsLogs.filter(l => l.status === status && new Date(l.sent_at) >= today).length;
  },
};

