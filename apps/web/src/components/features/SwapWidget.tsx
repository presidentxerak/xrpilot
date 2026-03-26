'use client';

import { useState } from 'react';

interface SwapToken {
  currency: string;
  balance: string;
  issuer?: string;
}

export function SwapWidget() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken] = useState<SwapToken>({ currency: 'XRP', balance: '0' });
  const [toToken] = useState<SwapToken>({ currency: 'USD', balance: '0', issuer: '' });

  const estimatedRate = '0.50'; // placeholder
  const minimumReceived = toAmount ? (Number(toAmount) * 0.995).toFixed(2) : '0';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Swap</h3>

      {/* From Token */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">You send</span>
          <span className="text-xs text-gray-400">
            Balance: {fromToken.balance} {fromToken.currency}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 text-2xl font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 min-h-[44px]"
          />
          <div className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white min-h-[44px] flex items-center">
            {fromToken.currency}
          </div>
        </div>
      </div>

      {/* Swap Direction */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
          aria-label="Swap direction"
        >
          ↕
        </button>
      </div>

      {/* To Token */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">You receive</span>
          <span className="text-xs text-gray-400">
            Balance: {toToken.balance} {toToken.currency}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={toAmount}
            readOnly
            placeholder="0.00"
            className="flex-1 text-2xl font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 min-h-[44px]"
          />
          <div className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white min-h-[44px] flex items-center">
            {toToken.currency}
          </div>
        </div>
      </div>

      {/* Rate Info */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Rate</span>
          <span className="text-gray-700 dark:text-gray-300">
            1 {fromToken.currency} ≈ {estimatedRate} {toToken.currency}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">You&apos;ll receive at least</span>
          <span className="text-gray-700 dark:text-gray-300">
            {minimumReceived} {toToken.currency}
          </span>
        </div>
      </div>

      {/* Swap Button */}
      <button
        disabled={!fromAmount || Number(fromAmount) <= 0}
        className="w-full mt-6 bg-blue-600 text-white rounded-xl py-4 text-base font-medium min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        Swap
      </button>
    </div>
  );
}
