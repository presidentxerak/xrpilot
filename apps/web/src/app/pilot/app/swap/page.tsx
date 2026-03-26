'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/stores/wallet';
import { useUIStore } from '@/stores/ui';
import { useBalance } from '@/hooks/useWallet';
import { useRequireAuth } from '@/hooks/useSecurity';
import { AppShell } from '@/components/layout/AppShell';
import { SwapWidget } from '@/components/features/SwapWidget';

interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

export default function SwapPage() {
  const router = useRouter();
  const activeAccount = useWalletStore((s) => s.activeAccount);
  const isSimpleMode = useUIStore((s) => s.isSimpleMode);
  const address = activeAccount?.address ?? '';
  const { data: balance } = useBalance(address);
  const requireAuth = useRequireAuth();

  const [fromToken, setFromToken] = useState('XRP');
  const [toToken, setToToken] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced mode state
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');

  // Mock data for display
  const estimatedRate = toToken ? 0.52 : 0;
  const estimatedOutput = parseFloat(fromAmount || '0') * estimatedRate;
  const slippagePct = 0.5;

  const availableTokens = [
    { symbol: 'XRP', name: 'XRP' },
    { symbol: 'USD', name: 'US Dollar (Gatehub)' },
    { symbol: 'EUR', name: 'Euro (Gatehub)' },
    { symbol: 'BTC', name: 'Bitcoin (Gatehub)' },
  ];

  const mockOrderBook: { asks: OrderBookEntry[]; bids: OrderBookEntry[] } = {
    asks: [
      { price: '0.5250', amount: '1,000', total: '525.00' },
      { price: '0.5255', amount: '2,500', total: '1,313.75' },
      { price: '0.5260', amount: '500', total: '263.00' },
    ],
    bids: [
      { price: '0.5240', amount: '1,200', total: '628.80' },
      { price: '0.5235', amount: '3,000', total: '1,570.50' },
      { price: '0.5230', amount: '800', total: '418.40' },
    ],
  };

  const handleSwap = async () => {
    const authorized = await requireAuth('swap');
    if (!authorized) return;
    // Execute swap via wallet-core / xrpl-client
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-raised"
              aria-label="Go back"
            >
              <span className="text-xl">&larr;</span>
            </button>
            <h1 className="text-xl font-bold text-content">Swap</h1>
          </div>

          {!isSimpleMode && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm font-medium text-accent min-h-touch flex items-center"
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </button>
          )}
        </div>

        {/* Simple Swap Widget */}
        {!showAdvanced && (
          <div className="space-y-5 animate-fade-in">
            <SwapWidget
              fromToken={fromToken}
              toToken={toToken}
              fromAmount={fromAmount}
              estimatedOutput={estimatedOutput}
              availableBalance={balance ?? 0}
              availableTokens={availableTokens}
              onFromTokenChange={setFromToken}
              onToTokenChange={setToToken}
              onFromAmountChange={setFromAmount}
              onSwap={handleSwap}
            />

            {/* Rate & Slippage Info */}
            {toToken && parseFloat(fromAmount || '0') > 0 && (
              <div className="pilot-card space-y-3 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-content-secondary">
                    Estimated rate
                  </span>
                  <span className="text-content">
                    1 {fromToken} = {estimatedRate} {toToken}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-content-secondary">
                    Price may vary by
                  </span>
                  <span className="text-content">
                    up to {slippagePct}%
                  </span>
                </div>

                <div className="rounded-lg bg-accent-subtle p-3">
                  <p className="text-xs text-content-secondary leading-relaxed">
                    The final amount you receive may differ slightly from the
                    estimate. This happens because prices can change between the
                    time you start and complete the swap. Your swap will not go
                    through if the price moves more than {slippagePct}%.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Mode */}
        {showAdvanced && (
          <div className="space-y-5 animate-fade-in">
            {/* Order Type Tabs */}
            <div className="flex rounded-pilot bg-surface-raised p-1">
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 rounded-[10px] py-2.5 text-sm font-medium transition-colors min-h-touch ${
                  orderType === 'market'
                    ? 'bg-surface text-content shadow-card'
                    : 'text-content-tertiary'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 rounded-[10px] py-2.5 text-sm font-medium transition-colors min-h-touch ${
                  orderType === 'limit'
                    ? 'bg-surface text-content shadow-card'
                    : 'text-content-tertiary'
                }`}
              >
                Limit Order
              </button>
            </div>

            {/* Swap Inputs */}
            <SwapWidget
              fromToken={fromToken}
              toToken={toToken}
              fromAmount={fromAmount}
              estimatedOutput={estimatedOutput}
              availableBalance={balance ?? 0}
              availableTokens={availableTokens}
              onFromTokenChange={setFromToken}
              onToTokenChange={setToToken}
              onFromAmountChange={setFromAmount}
              onSwap={handleSwap}
            />

            {/* Limit Price (limit orders only) */}
            {orderType === 'limit' && (
              <div>
                <label
                  htmlFor="limitPrice"
                  className="mb-1.5 block text-sm font-medium text-content"
                >
                  Limit Price
                </label>
                <input
                  id="limitPrice"
                  type="number"
                  inputMode="decimal"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="0.00"
                  className="pilot-input"
                  min="0"
                  step="any"
                />
                <p className="mt-1 text-xs text-content-tertiary">
                  Your order will execute when the price reaches this level.
                </p>
              </div>
            )}

            {/* Order Book */}
            <div className="pilot-card p-4">
              <h3 className="mb-3 text-sm font-medium text-content">
                Order Book
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Bids */}
                <div>
                  <div className="mb-2 grid grid-cols-2 text-xs text-content-tertiary">
                    <span>Price</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {mockOrderBook.bids.map((bid, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-2 py-1 text-xs"
                    >
                      <span className="text-success">{bid.price}</span>
                      <span className="text-right text-content-secondary">
                        {bid.amount}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Asks */}
                <div>
                  <div className="mb-2 grid grid-cols-2 text-xs text-content-tertiary">
                    <span>Price</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {mockOrderBook.asks.map((ask, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-2 py-1 text-xs"
                    >
                      <span className="text-danger">{ask.price}</span>
                      <span className="text-right text-content-secondary">
                        {ask.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Liquidity Warning */}
            {toToken && (
              <div className="rounded-pilot bg-warning-subtle p-3">
                <p className="text-xs font-medium text-warning mb-1">
                  Low liquidity warning
                </p>
                <p className="text-xs text-content-secondary">
                  There may not be enough available at the current price.
                  Large swaps could result in a worse rate than expected.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
