export type UserRole = 'student' | 'parent' | 'admin';

export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    studentId?: string;
    createdAt: string;
    isPremium: boolean;
}

export interface SignedSessionPayload {
    user: SessionUser;
    exp: number; // Unix epoch ms
}

export const SESSION_COOKIE_NAME = 'auth_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
    return (
        process.env.SESSION_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        'conetica-local-dev-secret-change-in-production'
    );
}

function toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

async function importHmacKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    return globalThis.crypto.subtle.importKey(
        'raw',
        encoder.encode(getSecret()),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

export async function createSessionToken(user: SessionUser): Promise<string> {
    const payload: SignedSessionPayload = {
        user,
        exp: Date.now() + SESSION_TTL_MS,
    };
    const encoder = new TextEncoder();
    const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
    const key = await importHmacKey();
    const signatureBuffer = await globalThis.crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(encodedPayload)
    );
    const encodedSig = toBase64Url(new Uint8Array(signatureBuffer));
    return `${encodedPayload}.${encodedSig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SignedSessionPayload | null> {
    if (!token || !token.includes('.')) {
        return null;
    }

    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encodedPayload, encodedSig] = parts;

    try {
        const encoder = new TextEncoder();
        const key = await importHmacKey();
        const sigBytes = fromBase64Url(encodedSig);
        const valid = await globalThis.crypto.subtle.verify(
            'HMAC',
            key,
            sigBytes.buffer as ArrayBuffer,
            encoder.encode(encodedPayload)
        );

        if (!valid) return null;

        const payloadJson = new TextDecoder().decode(fromBase64Url(encodedPayload));
        const parsed = JSON.parse(payloadJson) as SignedSessionPayload;

        if (!parsed?.user?.role || !parsed?.exp || Date.now() > parsed.exp) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}
