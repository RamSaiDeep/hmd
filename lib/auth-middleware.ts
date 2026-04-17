import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";

export async function authenticateRequest() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { 
        success: false, 
        error: "Authentication required",
        user: null 
      };
    }
    
    return { 
      success: true, 
      error: null,
      user 
    };
  } catch (error) {
    return { 
      success: false, 
      error: "Authentication failed",
      user: null 
    };
  }
}

export function requireAuth(handler: (user: any, request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest();
    
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" }, 
        { status: 401 }
      );
    }
    
    return handler(auth.user, request);
  };
}

export function createSecureResponse(data: any, status: number = 200) {
  // Add security headers to API responses
  const response = NextResponse.json(data, { status });
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
