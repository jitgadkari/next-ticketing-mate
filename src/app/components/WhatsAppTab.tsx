'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IoLogoWhatsapp } from 'react-icons/io';

type WhatsAppStatus = 'disconnected' | 'qr' | 'authenticated' | 'active';

interface WhatsAppState {
  status: WhatsAppStatus;
  qrCode: string | null;
}

export default function WhatsAppTab() {
  const [isLoading, setIsLoading] = useState(true);
  // const [isRestarting, setIsRestarting] = useState(false);
  const [state, setState] = useState<WhatsAppState>({
    status: 'disconnected',
    qrCode: null,
  });

  const checkStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/status`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Status check failed');
      const data = await res.json();

      let normalizedStatus: WhatsAppStatus = 'disconnected';
      if (data.status === 'connected') normalizedStatus = 'active';
      else if (data.status === 'connecting') normalizedStatus = 'authenticated';
      else if (data.status === 'qr_required') normalizedStatus = 'qr';

      const newState: WhatsAppState = { status: normalizedStatus, qrCode: null };

      if (normalizedStatus === 'qr') {
        const qrRes = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/qr`);
        const qrData = await qrRes.json();
        if (qrData.qr) newState.qrCode = qrData.qr;
      }

      setState(prev => {
        if (prev.status !== newState.status) {
          if (newState.status === 'active') toast.success('WhatsApp Connected!');
          else if (newState.status === 'qr') toast('Scan QR code to connect', { icon: '📱' });
          else if (newState.status === 'disconnected') toast.error('WhatsApp Disconnected');
        }
        return newState;
      });
    } catch (err) {
      console.error("❌ Status check error:", err);
      setState({ status: 'disconnected', qrCode: null });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInit = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/init`, {
        method: 'POST',
      });
      const data = await res.json();
  
      if (res.ok && data.success) {
        toast.success(data.message || 'WhatsApp client initializing...');
        setTimeout(() => checkStatus(), 3000);
      } else {
        toast.error(data.error || 'Unauthorized access or init failed');
        console.error("Initialization error:", data);
      }
    } catch (err) {
      toast.error('Failed to initialize client');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/logout`, { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      toast.success('Logged out successfully');
      setState({ status: 'disconnected', qrCode: null });
    } catch (err) {
      toast.error('Failed to logout');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleRestartServer = async () => {
  //   try {
  //     setIsRestarting(true);
  //     setIsLoading(true);
  //     const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/restart`, { method: 'POST' });
  //     if (!res.ok) throw new Error('Restart failed');
  //     toast.success('Client restarting...');
  //     setTimeout(() => checkStatus(), 4000);
  //   } catch (err) {
  //     toast.error('Restart failed');
  //     console.error(err);
  //   } finally {
  //     setIsRestarting(false);
  //     setIsLoading(false);
  //   }
  // };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 min-h-[400px] bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <IoLogoWhatsapp className="text-3xl text-green-600" />
        <h2 className="text-2xl font-semibold text-black">WhatsApp Connection</h2>
      </div>

      <div className="w-full max-w-md">
        {isLoading ? (
          <div className="text-center space-y-2">
            <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-green-500 rounded-full mx-auto" />
            <p className="text-gray-600">Loading WhatsApp status...</p>
          </div>
        ) : state.status === 'disconnected' ? (
          <div className="text-center">
            <p className="mb-4 text-red-600 font-medium">WhatsApp is not connected.</p>
            <button
              onClick={handleInit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Initialize WhatsApp
            </button>
          </div>
        ) : state.status === 'qr' && state.qrCode ? (
          <div className="text-center">
            <img src={state.qrCode} alt="Scan QR" className="mx-auto w-60 rounded" />
            <p className="mt-4 text-gray-700">Scan the QR using your WhatsApp app.</p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-green-700 text-lg font-medium">WhatsApp is {state.status}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
              {/* <button
                onClick={handleRestartServer}
                disabled={isRestarting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Restart
              </button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}