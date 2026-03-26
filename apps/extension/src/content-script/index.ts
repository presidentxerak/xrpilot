// Content script - bridges between page and extension background
const PILOT_PROVIDER_SCRIPT = `
  window.pilot = {
    _listeners: {},
    _requestId: 0,
    _pendingRequests: new Map(),

    async connect() {
      return this._sendMessage('CONNECT');
    },

    async getAddress() {
      return this._sendMessage('GET_ADDRESS');
    },

    async signTransaction(transaction) {
      return this._sendMessage('SIGN_TRANSACTION', { transaction });
    },

    async disconnect() {
      return this._sendMessage('DISCONNECT');
    },

    on(event, callback) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(callback);
    },

    off(event, callback) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    },

    _emit(event, data) {
      if (!this._listeners[event]) return;
      this._listeners[event].forEach(cb => cb(data));
    },

    _sendMessage(type, payload) {
      return new Promise((resolve, reject) => {
        const id = ++this._requestId;
        this._pendingRequests.set(id, { resolve, reject });
        window.postMessage({ source: 'pilot-provider', type, payload, id }, '*');
      });
    }
  };
`;

// Inject provider into page context
const script = document.createElement('script');
script.textContent = PILOT_PROVIDER_SCRIPT;
(document.head || document.documentElement).appendChild(script);
script.remove();

// Listen for messages from page and forward to background
window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.source !== 'pilot-provider') return;

  chrome.runtime.sendMessage({
    type: event.data.type,
    payload: event.data.payload,
    origin: window.location.origin,
    id: event.data.id,
  }, (response) => {
    window.postMessage({
      source: 'pilot-background',
      id: event.data.id,
      response,
    }, '*');
  });
});

// Listen for responses from background and forward to page
window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.source !== 'pilot-background') return;
  // Provider script handles resolution via _pendingRequests
});

// Forward background events to page
chrome.runtime.onMessage.addListener((message) => {
  if (message.source === 'pilot-event') {
    window.postMessage({
      source: 'pilot-event',
      event: message.event,
      data: message.data,
    }, '*');
  }
});
