import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    
    if (!baseUrl) {
      return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
    }

    const apiUrl = `${baseUrl}trade/${id}`;
    
    console.log(`Fetching trade details from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      cache: 'no-store'
    });

    const raw = await response.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (e) {
      const contentType = response.headers.get('content-type') || '';
      console.error('Failed to parse backend response as JSON', { contentType, status: response.status });
      return NextResponse.json(
        { success: false, error: 'Backend returned non-JSON response', raw: raw.slice(0, 2000) },
        { status: 502 }
      );
    }
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.message || data?.error || 'Failed to fetch trade' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in P2P trade fetch proxy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    
    if (!baseUrl) {
      return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
    }

    const body = await request.json();
    const apiUrl = `${baseUrl}trade/${id}`;
    
    console.log(`Updating trade at: ${apiUrl}`, body);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const raw = await response.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (e) {
      const contentType = response.headers.get('content-type') || '';
      console.error('Failed to parse backend response as JSON', { contentType, status: response.status });
      return NextResponse.json(
        { success: false, error: 'Backend returned non-JSON response', raw: raw.slice(0, 2000) },
        { status: 502 }
      );
    }
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.message || data?.error || 'Failed to update trade' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in P2P trade update proxy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
