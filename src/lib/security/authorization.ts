import { getSupabaseAdmin } from '../supabase';
import { sanitizeUuid } from './sanitization';

/**
 * Authorization utilities for role-based access control
 */

export type UserRole = 'student' | 'parent' | 'admin';

export interface AuthContext {
    userId: string;
    role: UserRole;
    studentId?: string; // For parents, the ID of their child
}

/**
 * Verify user has permission to access a resource
 */
export async function verifyResourceAccess(
    context: AuthContext,
    resourceType: 'user' | 'transaction' | 'progress' | 'appointment',
    resourceId: string
): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    // Sanitize inputs
    const safeResourceId = sanitizeUuid(resourceId);
    const safeUserId = sanitizeUuid(context.userId);

    // Admins have access to everything
    if (context.role === 'admin') {
        return true;
    }

    switch (resourceType) {
        case 'user': {
            // Students can only access their own data
            if (context.role === 'student') {
                return safeResourceId === safeUserId;
            }

            // Parents can only access their child's data
            if (context.role === 'parent' && context.studentId) {
                return safeResourceId === sanitizeUuid(context.studentId);
            }

            return false;
        }

        case 'transaction': {
            const { data } = await supabase
                .from('transactions')
                .select('user_id')
                .eq('id', safeResourceId)
                .single();

            if (!data) return false;

            // Students can only see their own transactions
            if (context.role === 'student') {
                return data.user_id === safeUserId;
            }

            // Parents can see their child's transactions
            if (context.role === 'parent' && context.studentId) {
                return data.user_id === sanitizeUuid(context.studentId);
            }

            return false;
        }

        case 'progress': {
            const { data } = await supabase
                .from('user_progress')
                .select('user_id')
                .eq('id', safeResourceId)
                .single();

            if (!data) return false;

            if (context.role === 'student') {
                return data.user_id === safeUserId;
            }

            if (context.role === 'parent' && context.studentId) {
                return data.user_id === sanitizeUuid(context.studentId);
            }

            return false;
        }

        case 'appointment': {
            const { data } = await supabase
                .from('appointments')
                .select('user_id')
                .eq('id', safeResourceId)
                .single();

            if (!data) return false;

            if (context.role === 'student') {
                return data.user_id === safeUserId;
            }

            if (context.role === 'parent' && context.studentId) {
                return data.user_id === sanitizeUuid(context.studentId);
            }

            return false;
        }

        default:
            return false;
    }
}

/**
 * Get user's auth context from session
 */
export async function getUserAuthContext(userId: string): Promise<AuthContext | null> {
    const supabase = getSupabaseAdmin();
    const safeUserId = sanitizeUuid(userId);

    const { data: user, error } = await supabase
        .from('users')
        .select('id, role, student_id')
        .eq('id', safeUserId)
        .single();

    if (error || !user) {
        return null;
    }

    return {
        userId: user.id,
        role: user.role as UserRole,
        studentId: user.student_id || undefined
    };
}

/**
 * Verify parent-child relationship
 */
export async function verifyParentChildRelationship(
    parentId: string,
    studentId: string
): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    const safeParentId = sanitizeUuid(parentId);
    const safeStudentId = sanitizeUuid(studentId);

    const { data: parent } = await supabase
        .from('users')
        .select('student_id, role')
        .eq('id', safeParentId)
        .single();

    if (!parent || parent.role !== 'parent') {
        return false;
    }

    return parent.student_id === safeStudentId;
}

/**
 * Get accessible user IDs for a given user
 * - Students: only themselves
 * - Parents: only their child
 * - Admins: all users
 */
export async function getAccessibleUserIds(context: AuthContext): Promise<string[]> {
    if (context.role === 'admin') {
        // Admins can access all users
        const supabase = getSupabaseAdmin();
        const { data } = await supabase
            .from('users')
            .select('id');

        return data?.map((u: any) => u.id) || [];
    }

    if (context.role === 'parent' && context.studentId) {
        // Parents can only access their child
        return [context.studentId];
    }

    // Students can only access themselves
    return [context.userId];
}

/**
 * Filter query results based on user access
 */
export function applyAccessFilter<T extends { user_id: string }>(
    data: T[],
    context: AuthContext
): T[] {
    if (context.role === 'admin') {
        return data;
    }

    const allowedUserIds = context.role === 'parent' && context.studentId
        ? [context.studentId]
        : [context.userId];

    return data.filter(item => allowedUserIds.includes(item.user_id));
}

/**
 * Verify API key for webhook endpoints
 */
export function verifyWebhookSignature(
    signature: string,
    payload: string,
    secret: string
): boolean {
    // This is a placeholder - actual implementation depends on provider
    // For Stripe, use stripe.webhooks.constructEvent
    // For MercadoPago, verify according to their docs
    return true;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
    context: AuthContext,
    permission: 'read' | 'write' | 'delete',
    resource: 'users' | 'transactions' | 'modules' | 'appointments'
): boolean {
    // Admins have all permissions
    if (context.role === 'admin') {
        return true;
    }

    // Students have limited permissions
    if (context.role === 'student') {
        if (permission === 'read') {
            return ['transactions', 'modules', 'appointments'].includes(resource);
        }
        if (permission === 'write') {
            return ['appointments'].includes(resource);
        }
        return false;
    }

    // Parents have read-only access to their child's data
    if (context.role === 'parent') {
        return permission === 'read' &&
            ['transactions', 'modules', 'appointments'].includes(resource);
    }

    return false;
}
