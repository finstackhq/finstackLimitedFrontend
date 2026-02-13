import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    if (!baseUrl) {
      return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
    }

    // Extract query parameters (e.g., ?page=2&limit=20)
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // The env var includes /api/, so we just append 'ads' and query params
    const apiUrl = `${baseUrl}ads?${queryString}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Ensure we get fresh data
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch ads from backend:', response.status, errorText);
        return NextResponse.json({ success: false, error: `Backend returned ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in P2P ads proxy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    if (!baseUrl) {
      return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { adId, amountSource, paymentMethod, paymentDetails } = body;

    if (!adId) {
      return NextResponse.json({ success: false, error: 'Ad ID is required' }, { status: 400 });
    }

    // Forward all relevant fields to backend
    const tradeData: any = { amountSource };
    if (paymentMethod !== undefined) tradeData.paymentMethod = paymentMethod;
    if (paymentDetails !== undefined) tradeData.paymentDetails = paymentDetails;

    const apiUrl = `${baseUrl}trade/initiate/${adId}`;

    console.log(`Initiating trade at ${apiUrl}`);
    console.log('Request payload:', JSON.stringify(tradeData, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify(tradeData),
      cache: 'no-store'
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error('Backend trade initiation failed:', data);
        return NextResponse.json({ success: false, error: data.message || 'Failed to initiate trade' }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in P2P trade initiation proxy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
