import { z } from 'zod';

/**
 * Sanitization utilities to prevent XSS and injection attacks.
 * Uses pure JS implementation so serverless/edge runtimes never load jsdom.
 */

const ALLOWED_BASIC_TAGS = new Set(['b', 'i', 'em', 'strong', 'p', 'br']);

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// HTML sanitization (keeps only safe basic formatting tags without attributes)
export function sanitizeHtml(dirty: string): string {
    const withoutDangerousBlocks = dirty
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

    return withoutDangerousBlocks.replace(/<\/?([a-zA-Z0-9-]+)(?:\s[^>]*)?>/g, (match, tagName: string) => {
        const lower = tagName.toLowerCase();
        if (!ALLOWED_BASIC_TAGS.has(lower)) {
            return '';
        }
        const isClosing = match.startsWith('</');
        if (lower === 'br') return '<br />';
        return isClosing ? `</${lower}>` : `<${lower}>`;
    });
}

// Remove all HTML tags safely
export function stripHtml(dirty: string): string {
    return escapeHtml(
        dirty
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, '')
    );
}

// Sanitize user input (remove dangerous characters)
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .substring(0, 1000); // Limit length
}

// Sanitize email
export function sanitizeEmail(email: string): string {
    const emailSchema = z.string().email();
    try {
        return emailSchema.parse(email.toLowerCase().trim());
    } catch {
        throw new Error('Invalid email format');
    }
}

// Sanitize UUID
export function sanitizeUuid(uuid: string): string {
    const uuidSchema = z.string().uuid();
    try {
        return uuidSchema.parse(uuid);
    } catch {
        throw new Error('Invalid UUID format');
    }
}

// Sanitize URL
export function sanitizeUrl(url: string): string {
    const urlSchema = z.string().url();
    try {
        const parsed = urlSchema.parse(url);
        // Only allow http and https protocols
        if (!parsed.startsWith('http://') && !parsed.startsWith('https://')) {
            throw new Error('Invalid URL protocol');
        }
        return parsed;
    } catch {
        throw new Error('Invalid URL format');
    }
}

// Sanitize phone number (Mexican format)
export function sanitizePhone(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Validate Mexican phone number (10 digits)
    if (cleaned.length !== 10) {
        throw new Error('Invalid phone number format');
    }

    return cleaned;
}

// Sanitize SQL-like strings (prevent SQL injection)
export function sanitizeSqlString(input: string): string {
    return input
        .replace(/['";\\]/g, '') // Remove SQL special characters
        .replace(/--/g, '') // Remove SQL comments
        .replace(/\/\*/g, '') // Remove multi-line comment start
        .replace(/\*\//g, '') // Remove multi-line comment end
        .trim();
}

// Validate and sanitize JSON
export function sanitizeJson<T>(input: string, schema: z.ZodSchema<T>): T {
    try {
        const parsed = JSON.parse(input);
        return schema.parse(parsed);
    } catch {
        throw new Error('Invalid JSON format or schema validation failed');
    }
}

// Extract first client IP safely behind reverse proxies
export function getClientIp(headers: { get(name: string): string | null }): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        const firstIp = forwarded.split(',')[0]?.trim();
        if (firstIp) return firstIp;
    }
    const realIp = headers.get('x-real-ip')?.trim();
    if (realIp) return realIp;
    return 'local';
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute
): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

// Clean up old rate limit records periodically
const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 60000); // Clean up every minute

if (typeof (cleanupTimer as unknown as { unref?: () => void }).unref === 'function') {
    (cleanupTimer as unknown as { unref: () => void }).unref();
}

// Prevent timing attacks for string comparison
export function secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    globalThis.crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
    }

    return result;
}

// Validate file upload
export function validateFileUpload(
    file: File,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB: number = 5
): void {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    // Check file name
    const sanitizedName = sanitizeInput(file.name);
    if (sanitizedName !== file.name) {
        throw new Error('Invalid file name');
    }
}
