# API Security Enhancements

## **Input Validation & Sanitization**

### **Complaint API Validation**
```typescript
// Enhanced validation for complaint submission
function validateComplaintData(data: any) {
  const errors: string[] = [];
  
  // Required fields
  if (!data.place || typeof data.place !== 'string' || data.place.trim().length === 0) {
    errors.push('Place is required and must be a non-empty string');
  }
  
  if (!data.issueType || typeof data.issueType !== 'string' || data.issueType.trim().length === 0) {
    errors.push('Issue type is required and must be a non-empty string');
  }
  
  // Optional fields with validation
  if (data.issueDetail && (typeof data.issueDetail !== 'string' || data.issueDetail.length > 1000)) {
    errors.push('Issue detail must be a string with max 1000 characters');
  }
  
  if (data.description && (typeof data.description !== 'string' || data.description.length > 2000)) {
    errors.push('Description must be a string with max 2000 characters');
  }
  
  // Sanitize inputs
  if (data.place) data.place = sanitizeString(data.place);
  if (data.issueType) data.issueType = sanitizeString(data.issueType);
  if (data.issueDetail) data.issueDetail = sanitizeString(data.issueDetail);
  if (data.description) data.description = sanitizeString(data.description);
  
  return { isValid: errors.length === 0, errors, sanitizedData: data };
}

function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent SQL injection
    .substring(0, 2000); // Limit length
}
```

### **Music Request API Validation**
```typescript
function validateMusicRequestData(data: any) {
  const errors: string[] = [];
  
  // Required fields
  if (!data.eventName || typeof data.eventName !== 'string' || data.eventName.trim().length === 0) {
    errors.push('Event name is required');
  }
  
  if (!data.eventDate || !isValidDate(data.eventDate)) {
    errors.push('Valid event date is required');
  }
  
  if (!data.venue || typeof data.venue !== 'string' || data.venue.trim().length === 0) {
    errors.push('Venue is required');
  }
  
  // Validate sound items
  if (!Array.isArray(data.soundItems) || data.soundItems.length === 0) {
    errors.push('At least one sound item is required');
  } else {
    data.soundItems.forEach((item: any, index: number) => {
      if (!item.item || typeof item.item !== 'string') {
        errors.push(`Sound item ${index + 1} must have a valid item name`);
      }
      if (!item.quantity || typeof item.quantity !== 'string') {
        errors.push(`Sound item ${index + 1} must have a valid quantity`);
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date > new Date();
}
```

## **Rate Limiting Implementation**

### **Redis-based Rate Limiting**
```typescript
// Simple in-memory rate limiting (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

// Usage in API routes
export async function checkRateLimit(request: Request): Promise<boolean> {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const identifier = `${ip}-${userAgent}`;
  
  return rateLimit(identifier, 100, 60000); // 100 requests per minute
}
```

### **API Route Protection**
```typescript
// Enhanced API route middleware
export async function secureApiRoute(request: Request): Promise<{ authorized: boolean; error?: string }> {
  // 1. Check rate limiting
  if (!await checkRateLimit(request)) {
    return { authorized: false, error: 'Rate limit exceeded' };
  }
  
  // 2. Check authentication
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { authorized: false, error: 'Authentication required' };
  }
  
  // 3. Check user status
  if (user.banned) {
    return { authorized: false, error: 'Account suspended' };
  }
  
  return { authorized: true };
}
```

## **Environment Security**

### **Secure Environment Variables**
```typescript
// Environment variable validation
function validateEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  // Validate URL format
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  } catch {
    throw new Error('Invalid SUPABASE_URL format');
  }
  
  // Validate key formats (basic check)
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ')) {
    throw new Error('Invalid SUPABASE_ANON_KEY format');
  }
}

// Call this on startup
validateEnvironmentVariables();
```

### **Service Role Key Protection**
```typescript
// Service role key wrapper with audit logging
export async function executeWithServiceRole<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  context: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const result = await operation(supabase);
    
    // Log successful operation
    console.log('Service role operation completed', {
      context,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    return result;
  } catch (error) {
    // Log failed operation
    console.error('Service role operation failed', {
      context,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}
```

## **Database Security**

### **SQL Injection Prevention**
```typescript
// Use parameterized queries (Prisma already handles this)
export async function secureUserQuery(userId: string) {
  // Prisma automatically prevents SQL injection
  return await prisma.user.findUnique({
    where: { id: userId }, // Safe parameterized query
    select: {
      id: true,
      email: true,
      name: true,
      role: true
      // Never select sensitive fields like passwords
    }
  });
}

// Additional validation for dynamic queries
export function isValidUserId(id: string): boolean {
  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
```

### **Connection Security**
```typescript
// Enhanced database connection with security
export function createSecureDatabaseConnection() {
  const connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    // Additional security options
    ssl: {
      rejectUnauthorized: true, // Enforce SSL certificate validation
      minVersion: 'TLSv1.2'    // Require minimum TLS version
    },
    // Connection pooling for security
    poolTimeout: 10000,
    connectionLimit: 20
  };
  
  return connectionConfig;
}
```

## **Monitoring & Logging**

### **Security Event Logging**
```typescript
interface SecurityEvent {
  type: 'authentication_failure' | 'authorization_failure' | 'rate_limit_exceeded' | 'suspicious_request';
  userId?: string;
  ip: string;
  userAgent: string;
  path: string;
  timestamp: Date;
  details?: any;
}

export function logSecurityEvent(event: SecurityEvent) {
  console.warn('SECURITY_EVENT', JSON.stringify(event));
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Integrate with security monitoring tools
    // Example: sendToSecurityService(event);
  }
}

// Usage example
export function logSuspiciousRequest(request: Request, reason: string) {
  logSecurityEvent({
    type: 'suspicious_request',
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    path: new URL(request.url).pathname,
    timestamp: new Date(),
    details: { reason }
  });
}
```

## **Implementation Priority**

1. **Immediate**: Apply RLS policies in Supabase
2. **High**: Implement input validation
3. **High**: Add rate limiting
4. **Medium**: Environment security
5. **Medium**: Monitoring and logging

---

**These enhancements provide comprehensive API security while maintaining functionality.**
