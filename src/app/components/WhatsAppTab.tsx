'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { IoLogoWhatsapp } from 'react-icons/io';

type WhatsAppStatus = 'disconnected' | 'qr' | 'authenticated' | 'active';

interface WhatsAppState {
  status: WhatsAppStatus;
  qrCode: string | null;
}

export default function WhatsAppTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);
  const [state, setState] = useState<WhatsAppState>({
    status: 'disconnected',
    qrCode: null,
  });

  const checkStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/status`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch status');
      
      const data = await response.json();
      console.log("data", data)
      setState(prev => {
        // Always update if we have a QR code
        if (data.state === 'QR_READY' && data.qr) {
          return {
            ...prev,
            status: 'qr',
            qrCode: data.qr
          };
        }
        
        // For other states, check if anything changed
        if (data.state === prev.status && data.qr === prev.qrCode) {
          return prev;
        }

        const newState = { ...prev };

        // Handle state transitions
        switch (data.state) {
          case 'ACTIVE':
            if (prev.status !== 'active') {
              newState.status = 'active';
              newState.qrCode = null;
              if (prev.status === 'qr') {
                toast.success('WhatsApp Connected!', { 
                  id: 'whatsapp-status',
                  duration: 3000
                });
              }
            }
            break;

          case 'AUTHENTICATED':
            if (prev.status !== 'authenticated') {
              newState.status = 'authenticated';
              newState.qrCode = null;
              if (prev.status === 'qr') {
                toast.success('WhatsApp Connected!', { 
                  id: 'whatsapp-status',
                  duration: 3000
                });
              }
            }
            break;

          case 'QR_READY':
            // Only update QR if we have a new one
            if (data.qr && data.qr !== prev.qrCode) {
              newState.status = 'qr';
              newState.qrCode = data.qr;
              // Only show toast when transitioning to QR state
              if (!isRestarting && prev.status !== 'qr') {
                toast('Scan QR code to connect', {
                  icon: '📱',
                  id: 'whatsapp-status',
                  duration: 3000
                });
              }
            }
            break;

          case 'DISCONNECTED':
            if (prev.status !== 'disconnected') {
              newState.status = 'disconnected';
              newState.qrCode = null;
              if (!isRestarting) {
                toast.error('WhatsApp Disconnected', { 
                  id: 'whatsapp-status',
                  duration: 3000
                });
              }
            }
            break;
        }

        return newState;
      });
    } catch (error) {
      console.error('WhatsApp status error:', error);
      setState({ status: 'disconnected', qrCode: null });
      if (!isRestarting) {
        toast.error('Error connecting to WhatsApp server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isComponentMounted = true;
    let pollTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;

    const startPolling = () => {
      const poll = async () => {
        if (!isComponentMounted) return;

        try {
          await checkStatus();
          retryCount = 0; // Reset retry count on success
          if (isComponentMounted) {
            pollTimeout = setTimeout(poll, 2000);
          }
        } catch (error) {
          console.error('Polling error:', error);
          retryCount++;
          
          if (retryCount <= maxRetries && isComponentMounted) {
            // Exponential backoff for retries
            const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
            pollTimeout = setTimeout(poll, delay);
          } else if (isComponentMounted) {
            setState(prev => ({
              ...prev,
              status: 'disconnected',
              qrCode: null
            }));
          }
        }
      };

      poll();
    };

    startPolling();

    return () => {
      isComponentMounted = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/logout`, { 
        method: 'POST' 
      });
      if (!response.ok) throw new Error('Failed to logout');
      const data = await response.json();
      console.log(data)
      toast.success('Logged out successfully', { id: 'whatsapp-logout' });
      setState({ status: 'disconnected', qrCode: null });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout', { id: 'whatsapp-error' });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRestartServer = async () => {
    try {
      setIsRestarting(true);
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/restart`, { 
        method: 'POST' 
      });
      if (!response.ok) throw new Error('Failed to restart server');
      
      toast.success('WhatsApp server is restarting...', { id: 'whatsapp-restart' });
      setState({ status: 'disconnected', qrCode: null });
      
      // Poll status more frequently right after restart
      const checkUntilReady = async () => {
        try {
          await checkStatus();
          if (state.status === 'qr' || state.status === 'authenticated') {
            setIsRestarting(false);
          } else {
            setTimeout(checkUntilReady, 1000);
          }
        } catch (error) {
          setTimeout(checkUntilReady, 1000);
        }
      };
      
      setTimeout(checkUntilReady, 2000);
    } catch (error) {
      console.error('Restart error:', error);
      toast.error('Failed to restart WhatsApp server', { id: 'whatsapp-error' });
      setIsRestarting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 min-h-[400px] bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <IoLogoWhatsapp className="text-3xl text-green-600" />
        <h2 className="text-2xl font-semibold text-black">WhatsApp Connection</h2>
      </div>

      <div className="w-full max-w-md">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-gray-600">
              {isRestarting ? 'Restarting WhatsApp server...' : 'Connecting to WhatsApp...'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {state.status === 'qr' && state.qrCode ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <QRCodeSVG 
                    value={state.qrCode}
                    size={256}
                    level="H"
                    includeMargin={true}
                    style={{ width: '100%', maxWidth: '256px' }}
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-gray-800">Scan the QR Code</p>
                  <ol className="text-sm text-gray-600 space-y-1 text-left">
                    <li>1. Open WhatsApp on your phone</li>
                    <li>2. Go to Settings &gt; WhatsApp Web/Desktop</li>
                    <li>3. Point your phone camera at the QR code</li>
                  </ol>
                </div>
              </div>
            ) : state.status === 'active' ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 text-green-800 p-6 rounded-xl border border-green-200">
                  <div className="text-4xl mb-2">🚀</div>
                  <p className="font-medium text-lg">WhatsApp Client Active</p>
                  <p className="text-sm mt-2 text-green-700">Your WhatsApp client is active and processing messages</p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleLogout}
                    disabled={isRestarting || isLoading}
                    className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                  >
                    Logout
                  </button>
                  <button
                    onClick={handleRestartServer}
                    disabled={isRestarting}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    Restart Connection
                  </button>
                </div>
              </div>
            ) : state.status === 'authenticated' ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 text-green-800 p-6 rounded-xl border border-green-200">
                  <div className="text-4xl mb-2">✓</div>
                  <p className="font-medium text-lg">WhatsApp Connected</p>
                  <p className="text-sm mt-2 text-green-700">Your WhatsApp account is now linked and ready to use</p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleLogout}
                    disabled={isRestarting || isLoading}
                    className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                  >
                    Logout
                  </button>
                  <button
                    onClick={handleRestartServer}
                    disabled={isRestarting}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    Restart Connection
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-red-50 text-red-800 p-6 rounded-xl border border-red-200">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="font-medium text-lg">WhatsApp Disconnected</p>
                  <p className="text-sm mt-2 text-red-700">Unable to connect to WhatsApp</p>
                </div>
                <button
                  onClick={handleRestartServer}
                  disabled={isRestarting}
                  className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {isRestarting ? 'Restarting...' : 'Restart Server'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
