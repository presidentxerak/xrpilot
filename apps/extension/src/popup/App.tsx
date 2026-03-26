import React, { useEffect } from 'react';
import { useExtensionStore } from './stores/extension';
import { Home } from './pages/Home';
import { Approve } from './pages/Approve';
import { SignTransaction } from './pages/SignTransaction';
import { Settings } from './pages/Settings';
import { Lock } from './pages/Lock';

export const App: React.FC = () => {
  const {
    currentPage,
    isLocked,
    navigate,
    setAddress,
    setBalance,
    setConnectedSite,
    setPendingRequest,
  } = useExtensionStore();

  useEffect(() => {
    // Check wallet state on mount
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (chrome.runtime.lastError) return;

      if (response?.isLocked) {
        navigate('lock');
      } else {
        if (response?.address) {
          setAddress(response.address);
        }
        navigate('home');
      }

      // Check for pending requests
      if (response?.pendingRequests?.length > 0) {
        const pending = response.pendingRequests[0];
        setPendingRequest({
          type: pending.type,
          data: pending.payload,
          origin: pending.origin,
        });

        if (pending.type === 'connect') {
          navigate('approve');
        } else if (pending.type === 'sign') {
          navigate('sign');
        }
      }
    });

    // Listen for incoming pending requests from background
    const handleMessage = (message: { type: string; payload?: Record<string, unknown> }) => {
      if (message.type === 'PENDING_REQUEST' && message.payload) {
        setPendingRequest({
          type: message.payload.requestType as string,
          data: message.payload.transaction ?? null,
          origin: message.payload.origin as string,
        });

        if (message.payload.requestType === 'connect') {
          navigate('approve');
        } else if (message.payload.requestType === 'sign') {
          navigate('sign');
        }
      }

      if (message.type === 'WALLET_LOCKED') {
        navigate('lock');
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [navigate, setAddress, setBalance, setConnectedSite, setPendingRequest]);

  // Force lock screen if locked
  useEffect(() => {
    if (isLocked && currentPage !== 'lock') {
      navigate('lock');
    }
  }, [isLocked, currentPage, navigate]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'approve':
        return <Approve />;
      case 'sign':
        return <SignTransaction />;
      case 'settings':
        return <Settings />;
      case 'lock':
        return <Lock />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="w-popup h-popup bg-pilot-background text-pilot-text flex flex-col overflow-hidden">
      {renderPage()}
    </div>
  );
};
