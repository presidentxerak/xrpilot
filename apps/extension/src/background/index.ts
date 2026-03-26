import { ConnectionManager } from './connection-manager';
import { MessageHandler } from './message-handler';

const AUTO_LOCK_DEFAULT_MS = 15 * 60 * 1000; // 15 minutes

interface WalletState {
  isLocked: boolean;
  address: string | null;
  network: string;
  autoLockTimer: ReturnType<typeof setTimeout> | null;
  autoLockDuration: number;
}

const state: WalletState = {
  isLocked: true,
  address: null,
  network: 'mainnet',
  autoLockTimer: null,
  autoLockDuration: AUTO_LOCK_DEFAULT_MS,
};

const connectionManager = new ConnectionManager();
const messageHandler = new MessageHandler(connectionManager, state);

function resetAutoLockTimer(): void {
  if (state.autoLockTimer) {
    clearTimeout(state.autoLockTimer);
  }
  state.autoLockTimer = setTimeout(() => {
    state.isLocked = true;
    state.autoLockTimer = null;
    notifyPopup({ type: 'WALLET_LOCKED' });
  }, state.autoLockDuration);
}

function notifyPopup(message: Record<string, unknown>): void {
  chrome.runtime.sendMessage(message).catch(() => {
    // Popup may not be open; ignore
  });
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener(
  (
    message: { type: string; payload?: unknown },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    const origin = sender.tab?.url ? new URL(sender.tab.url).origin : 'popup';

    // Reset auto-lock on activity
    if (!state.isLocked) {
      resetAutoLockTimer();
    }

    messageHandler
      .handle(message, origin, sender)
      .then(sendResponse)
      .catch((error: Error) => {
        sendResponse({ error: error.message });
      });

    // Return true to indicate async response
    return true;
  },
);

// Listen for connections from content scripts
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message: { type: string; payload?: unknown }) => {
    const origin = port.sender?.tab?.url
      ? new URL(port.sender.tab.url).origin
      : 'unknown';

    messageHandler
      .handle(message, origin, port.sender ?? {})
      .then((response) => {
        port.postMessage(response);
      })
      .catch((error: Error) => {
        port.postMessage({ error: error.message });
      });
  });
});

// Initialize state from storage on install/startup
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get([
    'address',
    'network',
    'autoLockDuration',
  ]);
  if (stored.address) {
    state.address = stored.address as string;
  }
  if (stored.network) {
    state.network = stored.network as string;
  }
  if (stored.autoLockDuration) {
    state.autoLockDuration = stored.autoLockDuration as number;
  }
});

chrome.runtime.onStartup.addListener(() => {
  state.isLocked = true;
});

export { state, connectionManager, resetAutoLockTimer };
