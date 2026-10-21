import { getToken, getUser, onSessionEvent } from './auth';

const RECONNECT_BASE = 1000;
const RECONNECT_MAX = 15000;
const HEART_INTERVAL = 30000;

let ws = null;
let reconnectAttempts = 0;
let heartbeatTimer = null;
let userClosed = false;

function buildUrl() {
  const user = getUser() || {};
  const uId = user.uId;
  const token = getToken();
  if (!uId || !token) return null;
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/user/ws?uId=${encodeURIComponent(uId)}&token=${encodeURIComponent(token)}`;
}

function onMessage(dispatch) {
  return event => {
    if (!event.data) return;
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch (e) {
      return;
    }
    if (payload && payload.id !== undefined) {
      dispatch(payload);
    }
  };
}

function clearHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function startHeartbeat() {
  clearHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send('ping'); } catch (e) { /* ignore */ }
    }
  }, HEART_INTERVAL);
}

export function connectMessageWs(onPush, onReconnect) {
  if (userClosed) return;
  const url = buildUrl();
  if (!url) return;
  try {
    ws = new WebSocket(url);
  } catch (e) {
    scheduleReconnect(onPush, onReconnect);
    return;
  }
  ws.onopen = () => {
    reconnectAttempts = 0;
    startHeartbeat();
    if (typeof onReconnect === 'function') onReconnect();
  };
  ws.onmessage = onMessage(onPush);
  ws.onclose = () => {
    clearHeartbeat();
    if (userClosed) return;
    scheduleReconnect(onPush, onReconnect);
  };
  ws.onerror = () => {
    try { ws && ws.close(); } catch (e) { /* ignore */ }
  };
}

function scheduleReconnect(onPush, onReconnect) {
  if (userClosed) return;
  reconnectAttempts += 1;
  const delay = Math.min(RECONNECT_BASE * Math.pow(2, reconnectAttempts - 1), RECONNECT_MAX);
  setTimeout(() => connectMessageWs(onPush, onReconnect), delay);
}

export function disconnectMessageWs() {
  userClosed = true;
  clearHeartbeat();
  if (ws) {
    try { ws.close(); } catch (e) { /* ignore */ }
    ws = null;
  }
}

export function resetMessageWsState() {
  userClosed = false;
  reconnectAttempts = 0;
}

onSessionEvent(event => {
  if (event && (event.type === 'login' || event.type === 'user-updated')) {
    resetMessageWsState();
  }
  if (event && event.type === 'logout') {
    disconnectMessageWs();
  }
});
