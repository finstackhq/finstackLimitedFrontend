import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    if (!baseUrl) {
      return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
    }

    // Get the access token from cookies
    const token = req.cookies.get('access_token')?.value || req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No access token found' }, { status: 401 });
    }

    const body = await req.json();

    // Append /ads to the base URL
    const apiUrl = `${baseUrl}ads`;

    console.log('[API] Proxying create ad request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create ad in backend:', response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ success: false, error: `Backend returned ${response.status}: ${JSON.stringify(errorJson)}` }, { status: response.status });
      } catch (e) {
        return NextResponse.json({ success: false, error: `Backend returned ${response.status}: ${errorText}` }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in merchant ads proxy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    if (!baseUrl) {
      return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
    }

    const token = req.cookies.get('access_token')?.value || req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No access token found' }, { status: 401 });
    }

    const apiUrl = `${baseUrl}my-ads`;

    console.log('[API] Proxying fetch my-ads request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch ads from backend:', response.status, errorText);
      return NextResponse.json({ success: false, error: `Backend returned ${response.status}: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in merchant my-ads proxy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    if (!baseUrl) {
      return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
    }

    const token = req.cookies.get('access_token')?.value || req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No access token found' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Ad ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const apiUrl = `${baseUrl}ads/${id}`;

    console.log('[API] Proxying patch ad request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update ad in backend:', response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ success: false, error: `Backend returned ${response.status}: ${JSON.stringify(errorJson)}` }, { status: response.status });
      } catch (e) {
        return NextResponse.json({ success: false, error: `Backend returned ${response.status}: ${errorText}` }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in merchant patch ad proxy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    if (!baseUrl) {
      return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
    }

    const token = req.cookies.get('access_token')?.value || req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No access token found' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Ad ID is required' }, { status: 400 });
    }

    const apiUrl = `${baseUrl}ads/${id}`;

    console.log('[API] Proxying delete ad request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete ad in backend:', response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json({ success: false, error: `Backend returned ${response.status}: ${JSON.stringify(errorJson)}` }, { status: response.status });
      } catch (e) {
        return NextResponse.json({ success: false, error: `Backend returned ${response.status}: ${errorText}` }, { status: response.status });
      }
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in merchant delete ad proxy:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
