import { describe, it, expect, beforeEach } from 'vitest';
import {
  PinManager,
  PinTooShortError,
  PinInvalidFormatError,
  PinNotSetupError,
  PinIncorrectError,
  PinLockedError,
  type PinStore,
} from '../src/pin';

class MemoryPinStore implements PinStore {
  private data = new Map<string, string>();
  async get(key: string) {
    return this.data.get(key) ?? null;
  }
  async set(key: string, value: string) {
    this.data.set(key, value);
  }
  async delete(key: string) {
    this.data.delete(key);
  }
}

describe('PinManager', () => {
  let store: MemoryPinStore;
  let pin: PinManager;

  beforeEach(() => {
    store = new MemoryPinStore();
    pin = new PinManager(store);
  });

  describe('setup', () => {
    it('sets up a PIN successfully', async () => {
      await pin.setup('123456');
      expect(await pin.isSetup()).toBe(true);
    });

    it('rejects PIN shorter than 6 digits', async () => {
      await expect(pin.setup('1234')).rejects.toThrow(PinTooShortError);
    });

    it('rejects non-digit PIN', async () => {
      await expect(pin.setup('abcdef')).rejects.toThrow(PinInvalidFormatError);
    });

    it('rejects alphanumeric PIN', async () => {
      await expect(pin.setup('123abc')).rejects.toThrow(PinInvalidFormatError);
    });
  });

  describe('verify', () => {
    beforeEach(async () => {
      await pin.setup('123456');
    });

    it('returns true for correct PIN', async () => {
      expect(await pin.verify('123456')).toBe(true);
    });

    it('returns false for incorrect PIN', async () => {
      expect(await pin.verify('654321')).toBe(false);
    });

    it('throws PinNotSetupError if no PIN is set', async () => {
      const fresh = new PinManager(new MemoryPinStore());
      await expect(fresh.verify('123456')).rejects.toThrow(PinNotSetupError);
    });

    it('resets failed attempts on successful verify', async () => {
      await pin.verify('000000'); // fail
      await pin.verify('000000'); // fail
      expect(await pin.getAttempts()).toBe(2);
      await pin.verify('123456'); // success
      expect(await pin.getAttempts()).toBe(0);
    });
  });

  describe('lockout', () => {
    beforeEach(async () => {
      await pin.setup('123456');
    });

    it('locks after 3 failed attempts', async () => {
      await pin.verify('000000');
      await pin.verify('000000');
      await pin.verify('000000');
      const state = await pin.getLockoutState();
      expect(state.locked).toBe(true);
      expect(state.failedAttempts).toBe(3);
    });

    it('throws PinLockedError when locked', async () => {
      for (let i = 0; i < 3; i++) {
        await pin.verify('000000');
      }
      await expect(pin.verify('123456')).rejects.toThrow(PinLockedError);
    });
  });

  describe('change', () => {
    beforeEach(async () => {
      await pin.setup('123456');
    });

    it('changes PIN with correct old PIN', async () => {
      await pin.change('123456', '654321');
      expect(await pin.verify('654321')).toBe(true);
      expect(await pin.verify('123456')).toBe(false);
    });

    it('rejects change with wrong old PIN', async () => {
      await expect(pin.change('000000', '654321')).rejects.toThrow(PinIncorrectError);
    });
  });
});
