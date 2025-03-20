'use client';

import WhatsAppTab from '../../components/WhatsAppTab';

export default function WhatsAppPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-black mb-6">WhatsApp Integration</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <WhatsAppTab />
      </div>
    </div>
  );
}