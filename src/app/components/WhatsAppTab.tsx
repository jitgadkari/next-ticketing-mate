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
  const [state, setState] = useState<WhatsAppState>({
    status: 'disconnected',
    qrCode: null,
  });

  const checkStatus = async () => {
    console.log("🔄 [checkStatus] Checking WhatsApp status...");
    try {
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/status`;
      console.log("🌐 Fetching status from:", url);
      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) throw new Error('Status check failed');

      const data = await res.json();
      console.log("✅ [checkStatus] Response data:", data);

      let normalizedStatus: WhatsAppStatus = 'disconnected';
      if (data.status === 'connected') normalizedStatus = 'active';
      else if (data.status === 'connecting') normalizedStatus = 'authenticated';
      else if (data.status === 'qr_required') normalizedStatus = 'qr';

      const newState: WhatsAppState = { status: normalizedStatus, qrCode: null };

      if (normalizedStatus === 'qr') {
        const qrUrl = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/qr`;
        console.log("📲 Fetching QR code from:", qrUrl);
        const qrRes = await fetch(qrUrl);
        const qrData = await qrRes.json();
        console.log("✅ [QR] QR Response:", qrData);
        if (qrData.qr) newState.qrCode = qrData.qr;
      }

      setState(prev => {
        if (prev.status !== newState.status) {
          console.log("🔁 State change from", prev.status, "→", newState.status);
          if (newState.status === 'active') toast.success('WhatsApp Connected!');
          else if (newState.status === 'qr') toast('Scan QR code to connect', { icon: '📱' });
          else if (newState.status === 'disconnected') toast.error('WhatsApp Disconnected');
        }
        return newState;
      });
    } catch (err) {
      console.error("❌ [checkStatus] Error:", err);
      setState({ status: 'disconnected', qrCode: null });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInit = async () => {
    console.log("⚙️ [handleInit] Initializing WhatsApp client...");
    try {
      setIsLoading(true);
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/init`;
      console.log("🌐 Sending init request to:", url);

      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      console.log(res)
      console.log("✅ [handleInit] Response:", data);
      console.log("✅ [handleInit] Response:", data.message);
      if (res.ok) {
        if (data.success){
          console.log(res.ok)
          console.log("✅ [handleInit] Success:", data.message);
          toast.success(data.message);
          setTimeout(() => checkStatus(), 3000);

        } else {
          console.log("❌ [handleInit] Error:", data.message);
          toast.error(data.message);
          setTimeout(() => checkStatus(), 3000);
        }
      } else {
        console.log("❌ [handleInit] Error:", data.message);
        toast.error("Failed to connect, Please Retry!");
        setTimeout(() => checkStatus(), 3000);
      }
    } catch (err) {
      console.error("❌ [handleInit] Error:", err);
      toast.error('Failed to initialize client');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log("🚪 [handleLogout] Logging out...");
    try {
      setIsLoading(true);
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/logout`;
      console.log("🌐 Sending logout request to:", url);

      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      console.log("✅ [handleLogout] Response:", data);

      if (!res.ok) throw new Error('Logout failed');

      toast.success('Logged out successfully');
      setState({ status: 'disconnected', qrCode: null });
    } catch (err) {
      console.error("❌ [handleLogout] Error:", err);
      toast.error('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 [useEffect] Component mounted. Checking status...");
    checkStatus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 min-h-[400px] bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <IoLogoWhatsapp className="text-3xl text-green-600" />
        <h2 className="text-2xl font-semibold text-black">WhatsApp Connection</h2>
      </div>

      <button
        onClick={checkStatus}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        Refresh Status
      </button>

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
