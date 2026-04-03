import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test basic database connection
    const response = await fetch('https://api.supabase.io/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
      }
    });

    if (response.ok) {
      return NextResponse.json({ 
        status: "Supabase API reachable",
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          databaseUrlLength: process.env.DATABASE_URL?.length || 0
        }
      });
    } else {
      return NextResponse.json({ 
        error: "Supabase API not reachable",
        status: response.status
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: "Connection test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
