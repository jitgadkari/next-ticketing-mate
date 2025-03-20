import { NextRequest, NextResponse } from 'next/server';

// GET /api/whatsapp - Get WhatsApp status
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/whatsapp/status`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch WhatsApp status');
    }

    const data = await response.json();
    
    // Provide fallback values as per initialization pattern
    return NextResponse.json({
      state: data?.state || 'DISCONNECTED',
      qr: data?.qr || null
    });
  } catch (error) {
    console.error('WhatsApp status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp status' },
      { status: 500 }
    );
  }
}

// POST /api/whatsapp?action=logout - Logout from WhatsApp
// POST /api/whatsapp?action=restart - Restart WhatsApp server
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!action || !['logout', 'restart'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action specified' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/api/whatsapp/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to ${action} WhatsApp`);
    }

    const data = await response.json();
    
    // Following initialization pattern with fallback values
    return NextResponse.json({
      success: true,
      message: data?.message || `WhatsApp ${action} successful`
    });
  } catch (error) {
    console.error(`WhatsApp ${action} error:`, error);
    return NextResponse.json(
      { error: `Failed to ${action} WhatsApp` },
      { status: 500 }
    );
  }
}
