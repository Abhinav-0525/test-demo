import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the session token from query parameter
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('token');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No session token provided' },
        { status: 401 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if session is valid and active
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or inactive session' },
        { status: 401 }
      );
    }

    // Get the brochure file path
    const brochurePath = path.join(process.cwd(), 'public', 'asbl_brochure.pdf');

    // Check if file exists
    if (!fs.existsSync(brochurePath)) {
      return NextResponse.json(
        { error: 'Brochure file not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = fs.readFileSync(brochurePath);

    // Create response with appropriate headers for viewing in browser
    const response = new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
      },
    });

    return response;
  } catch (error: any) {
    console.error('Error serving brochure:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}