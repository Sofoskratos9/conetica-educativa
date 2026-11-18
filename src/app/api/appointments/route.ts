import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
    SESSION_COOKIE_NAME,
    verifySessionToken,
} from '@/lib/session';
import {
    createUserNotification,
    ensurePostgresSchema,
    getDatabaseMode,
    getPgPool,
    logActivityEvent,
} from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sanitizeInput } from '@/lib/security/sanitization';

export interface AppointmentRecord {
    id: string;
    userId: string;
    studentName: string;
    serviceId: string;
    serviceName: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    notes?: string;
    createdAt: string;
}

const CreateAppointmentSchema = z.object({
    serviceId: z.string().min(1).max(60),
    serviceName: z.string().min(1).max(120),
    scheduledDate: z.string().min(4).max(40),
    scheduledTime: z.string().min(3).max(20),
    notes: z.string().max(400).optional(),
});

const UpdateStatusSchema = z.object({
    id: z.string().min(1),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']),
});

const globalForAppointments = globalThis as unknown as {
    __coneticaDemoAppointments?: AppointmentRecord[];
};

function getDemoAppointments(): AppointmentRecord[] {
    if (!globalForAppointments.__coneticaDemoAppointments) {
        globalForAppointments.__coneticaDemoAppointments = [
            {
                id: 'demo-app-1',
                userId: '00000000-0000-4000-8000-000000000001',
                studentName: 'María González',
                serviceId: 'mentoria-1on1',
                serviceName: 'Mentoría Personalizada 1:1',
                scheduledDate: '2026-11-20',
                scheduledTime: '10:00',
                status: 'confirmed',
                createdAt: new Date().toISOString(),
            },
            {
                id: 'demo-app-2',
                userId: '00000000-0000-4000-8000-000000000004',
                studentName: 'Ana Martínez',
                serviceId: 'vocacional',
                serviceName: 'Asesoría Vocacional RIASEC',
                scheduledDate: '2026-11-21',
                scheduledTime: '11:30',
                status: 'pending',
                createdAt: new Date().toISOString(),
            },
        ];
    }
    return globalForAppointments.__coneticaDemoAppointments;
}

function normalizeStatus(status: string): AppointmentRecord['status'] {
    if (status === 'canceled') return 'cancelled';
    if (status === 'confirmed' || status === 'pending' || status === 'cancelled' || status === 'completed') {
        return status;
    }
    return 'pending';
}

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const mode = getDatabaseMode();

    if (mode === 'postgres') {
        try {
            await ensurePostgresSchema();
            const pool = getPgPool();
            if (!pool) {
                return NextResponse.json({ appointments: [] });
            }
            const isAdmin = session.user.role === 'admin';
            const result = isAdmin
                ? await pool.query<{
                      id: string;
                      user_id: string;
                      student_name: string | null;
                      user_name: string | null;
                      service_id: string;
                      service_name: string;
                      scheduled_date: string;
                      scheduled_time: string;
                      status: string;
                      notes: string | null;
                      created_at: Date | string;
                  }>(
                      `SELECT a.id, a.user_id, a.student_name, u.name AS user_name,
                              a.service_id, a.service_name, a.scheduled_date, a.scheduled_time,
                              a.status, a.notes, a.created_at
                       FROM appointments a
                       LEFT JOIN users u ON u.id = a.user_id
                       ORDER BY a.created_at DESC
                       LIMIT 100`
                  )
                : await pool.query<{
                      id: string;
                      user_id: string;
                      student_name: string | null;
                      user_name: string | null;
                      service_id: string;
                      service_name: string;
                      scheduled_date: string;
                      scheduled_time: string;
                      status: string;
                      notes: string | null;
                      created_at: Date | string;
                  }>(
                      `SELECT a.id, a.user_id, a.student_name, u.name AS user_name,
                              a.service_id, a.service_name, a.scheduled_date, a.scheduled_time,
                              a.status, a.notes, a.created_at
                       FROM appointments a
                       LEFT JOIN users u ON u.id = a.user_id
                       WHERE a.user_id = $1
                       ORDER BY a.created_at DESC
                       LIMIT 50`,
                      [session.user.id]
                  );

            return NextResponse.json({
                appointments: result.rows.map((r) => ({
                    id: r.id,
                    userId: r.user_id,
                    studentName: r.student_name || r.user_name || 'Estudiante',
                    serviceId: r.service_id,
                    serviceName: r.service_name,
                    scheduledDate: String(r.scheduled_date).slice(0, 10),
                    scheduledTime: String(r.scheduled_time).slice(0, 5),
                    status: normalizeStatus(r.status),
                    notes: r.notes || undefined,
                    createdAt: new Date(r.created_at).toISOString(),
                })),
            });
        } catch (err) {
            console.error('[Appointments GET Postgres]', err);
            return NextResponse.json({ error: 'Error al obtener citas.' }, { status: 500 });
        }
    }

    if (mode === 'supabase') {
        try {
            const supabase = getSupabaseAdmin();
            let query = supabase
                .from('appointments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            if (session.user.role !== 'admin') {
                query = query.eq('user_id', session.user.id);
            }
            const { data, error } = await query;
            if (error) {
                return NextResponse.json({ error: 'Error al obtener citas.' }, { status: 500 });
            }
            return NextResponse.json({
                appointments: (data || []).map((r: any) => ({
                    id: r.id,
                    userId: r.user_id,
                    studentName: r.student_name || 'Estudiante',
                    serviceId: r.service_id,
                    serviceName: r.service_name,
                    scheduledDate: String(r.scheduled_date).slice(0, 10),
                    scheduledTime: String(r.scheduled_time).slice(0, 5),
                    status: normalizeStatus(r.status),
                    notes: r.notes || undefined,
                    createdAt: r.created_at,
                })),
            });
        } catch {
            return NextResponse.json({ error: 'Error al obtener citas.' }, { status: 500 });
        }
    }

    const demoList = getDemoAppointments();
    const appointments =
        session.user.role === 'admin'
            ? demoList
            : demoList.filter((a) => a.userId === session.user.id);
    return NextResponse.json({ appointments });
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'Debes iniciar sesión para agendar.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = CreateAppointmentSchema.parse(body);

        const cleanServiceId = sanitizeInput(parsed.serviceId).slice(0, 60);
        const cleanServiceName = sanitizeInput(parsed.serviceName).slice(0, 120);
        const cleanDate = sanitizeInput(parsed.scheduledDate).slice(0, 10);
        const cleanTime = sanitizeInput(parsed.scheduledTime).slice(0, 10);
        const cleanNotes = parsed.notes ? sanitizeInput(parsed.notes).slice(0, 400) : undefined;
        const mode = getDatabaseMode();

        if (mode === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            if (pool) {
                const inserted = await pool.query<{
                    id: string;
                    created_at: Date | string;
                }>(
                    `INSERT INTO appointments (user_id, student_name, service_id, service_name, scheduled_date, scheduled_time, status, notes)
                     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
                     RETURNING id, created_at`,
                    [
                        session.user.id,
                        session.user.name,
                        cleanServiceId,
                        cleanServiceName,
                        cleanDate,
                        cleanTime,
                        cleanNotes || null,
                    ]
                );
                await Promise.all([
                    logActivityEvent({
                        userId: session.user.id,
                        userName: session.user.name,
                        eventType: 'appointment_booked',
                        action: `Agendó "${cleanServiceName}" para ${cleanDate} a las ${cleanTime}`,
                    }),
                    createUserNotification({
                        userId: session.user.id,
                        title: 'Reserva registrada',
                        message: `Tu sesión "${cleanServiceName}" para el ${cleanDate} a las ${cleanTime} está pendiente de confirmación.`,
                        type: 'info',
                        actionLink: '/dashboard/booking',
                    }),
                ]);

                return NextResponse.json({
                    appointment: {
                        id: inserted.rows[0].id,
                        userId: session.user.id,
                        studentName: session.user.name,
                        serviceId: cleanServiceId,
                        serviceName: cleanServiceName,
                        scheduledDate: cleanDate,
                        scheduledTime: cleanTime,
                        status: 'pending',
                        notes: cleanNotes,
                        createdAt: new Date(inserted.rows[0].created_at).toISOString(),
                    },
                });
            }
        }

        if (mode === 'supabase') {
            const supabase = getSupabaseAdmin();
            const { data, error } = await supabase
                .from('appointments')
                .insert({
                    user_id: session.user.id,
                    service_id: cleanServiceId,
                    service_name: cleanServiceName,
                    scheduled_date: cleanDate,
                    scheduled_time: cleanTime,
                    status: 'pending',
                    notes: cleanNotes || null,
                })
                .select()
                .single();

            if (!error && data) {
                return NextResponse.json({
                    appointment: {
                        id: data.id,
                        userId: session.user.id,
                        studentName: session.user.name,
                        serviceId: cleanServiceId,
                        serviceName: cleanServiceName,
                        scheduledDate: cleanDate,
                        scheduledTime: cleanTime,
                        status: 'pending',
                        notes: cleanNotes,
                        createdAt: data.created_at,
                    },
                });
            }
        }

        const record: AppointmentRecord = {
            id: `app_${Date.now()}`,
            userId: session.user.id,
            studentName: session.user.name,
            serviceId: cleanServiceId,
            serviceName: cleanServiceName,
            scheduledDate: cleanDate,
            scheduledTime: cleanTime,
            status: 'pending',
            notes: cleanNotes,
            createdAt: new Date().toISOString(),
        };
        getDemoAppointments().unshift(record);
        return NextResponse.json({ appointment: record });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Datos de cita inválidos.' }, { status: 400 });
        }
        console.error('[Appointments POST]', error);
        return NextResponse.json({ error: 'No se pudo guardar la cita.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo administradores pueden modificar el estado.' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, status } = UpdateStatusSchema.parse(body);
        const mode = getDatabaseMode();

        if (mode === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            if (pool) {
                const upd = await pool.query<{
                    user_id: string;
                    student_name: string | null;
                    service_name: string;
                    scheduled_date: string;
                    scheduled_time: string;
                }>(
                    `UPDATE appointments
                     SET status = $1, updated_at = NOW()
                     WHERE id = $2
                     RETURNING user_id, student_name, service_name, scheduled_date, scheduled_time`,
                    [status, id]
                );
                const row = upd.rows[0];
                if (row) {
                    const statusLabel =
                        status === 'confirmed'
                            ? 'confirmada'
                            : status === 'cancelled'
                              ? 'cancelada'
                              : status === 'completed'
                                ? 'completada'
                                : 'pendiente';
                    await Promise.all([
                        logActivityEvent({
                            userId: session.user.id,
                            userName: session.user.name,
                            eventType: 'appointment_status_changed',
                            action: `Marcó cita de ${row.student_name || 'estudiante'} (${row.service_name}) como ${statusLabel}`,
                        }),
                        createUserNotification({
                            userId: row.user_id,
                            title: `Cita ${statusLabel}`,
                            message: `Tu sesión "${row.service_name}" del ${String(row.scheduled_date).slice(0, 10)} a las ${String(row.scheduled_time).slice(0, 5)} fue marcada como ${statusLabel}.`,
                            type: status === 'confirmed' ? 'success' : status === 'cancelled' ? 'warning' : 'info',
                            actionLink: '/dashboard/booking',
                        }),
                    ]);
                }
                return NextResponse.json({ success: true, id, status });
            }
        }

        if (mode === 'supabase') {
            const supabase = getSupabaseAdmin();
            const dbStatus = status === 'cancelled' ? 'canceled' : status;
            await supabase
                .from('appointments')
                .update({ status: dbStatus })
                .eq('id', id);
            return NextResponse.json({ success: true, id, status });
        }

        const list = getDemoAppointments();
        const found = list.find((a) => a.id === id);
        if (found) found.status = status;
        return NextResponse.json({ success: true, id, status });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'No se pudo actualizar la cita.' }, { status: 500 });
    }
}
