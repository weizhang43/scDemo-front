const TOKEN_KEY = 'sc_token';
const USER_KEY = 'sc_user';
const SESSION_EVENT_KEY = 'sc_session_event';

function readJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    localStorage.removeItem(key);
    return fallback;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser() {
  return readJson(USER_KEY, null);
}

export function setUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function removeUser() {
  localStorage.removeItem(USER_KEY);
}

export function getPerms() {
  const perms = readJson('sc_perms', []);
  return Array.isArray(perms) ? perms : [];
}

export function setPerms(perms) {
  localStorage.setItem('sc_perms', JSON.stringify(Array.isArray(perms) ? perms : []));
}

export function removePerms() {
  localStorage.removeItem('sc_perms');
}

export function clearAll() {
  removeToken();
  removeUser();
  removePerms();
}

export function broadcastSessionEvent(type) {
  localStorage.setItem(SESSION_EVENT_KEY, JSON.stringify({ type, at: Date.now() }));
  localStorage.removeItem(SESSION_EVENT_KEY);
}

export function onSessionEvent(handler) {
  const listener = event => {
    if (event.key !== SESSION_EVENT_KEY || !event.newValue) return;
    try {
      handler(JSON.parse(event.newValue));
    } catch (e) {
      // Ignore malformed cross-tab events.
    }
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
