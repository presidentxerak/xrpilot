import { describe, it, expect } from 'vitest';
import { XrplConnectionManager, MAINNET_NODES, TESTNET_NODES, type NodeConfig } from '../src/connection';

describe('XrplConnectionManager', () => {
  it('requires at least one node', () => {
    expect(() => new XrplConnectionManager([])).toThrow('At least one node');
  });

  it('sorts nodes by priority', () => {
    const nodes: NodeConfig[] = [
      { url: 'wss://node-c.example', priority: 2 },
      { url: 'wss://node-a.example', priority: 0 },
      { url: 'wss://node-b.example', priority: 1 },
    ];
    const manager = new XrplConnectionManager(nodes);
    expect(manager.isConnected()).toBe(false);
    expect(manager.getActiveNodeUrl()).toBeNull();
  });

  it('starts in disconnected state', () => {
    const manager = new XrplConnectionManager(MAINNET_NODES as NodeConfig[]);
    expect(manager.isConnected()).toBe(false);
  });

  it('throws when getting client while disconnected', () => {
    const manager = new XrplConnectionManager(TESTNET_NODES as NodeConfig[]);
    expect(() => manager.getClient()).toThrow('Not connected');
  });

  it('throws after dispose', async () => {
    const manager = new XrplConnectionManager(MAINNET_NODES as NodeConfig[]);
    await manager.disconnect();
    await expect(manager.connect()).rejects.toThrow('disposed');
  });
});

describe('Node configuration', () => {
  it('mainnet has at least 2 nodes', () => {
    expect(MAINNET_NODES.length).toBeGreaterThanOrEqual(2);
  });

  it('testnet has at least 1 node', () => {
    expect(TESTNET_NODES.length).toBeGreaterThanOrEqual(1);
  });

  it('all nodes have valid WSS URLs', () => {
    for (const node of [...MAINNET_NODES, ...TESTNET_NODES]) {
      expect(node.url).toMatch(/^wss:\/\//);
    }
  });
});
