import { NextRequest, NextResponse } from 'next/server';
import { EXANI_QUESTIONS, type ExaniArea, type ExaniQuestion } from '@/lib/exani-data';
import { ensurePostgresSchema, getDatabaseMode, getPgPool } from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    try {
        let customQuestions: ExaniQuestion[] = [];

        if (getDatabaseMode() === 'postgres') {
            await ensurePostgresSchema();
            const pool = getPgPool();
            if (pool) {
                const res = await pool.query<{
                    id: string;
                    area: ExaniArea;
                    difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
                    question: string;
                    options: string[];
                    correct_index: number;
                    explanation: string;
                }>(
                    `SELECT id, area, difficulty, question, options, correct_index, explanation
                     FROM exani_questions
                     WHERE active = true
                     ORDER BY created_at DESC`
                );

                customQuestions = res.rows.map((r, idx) => ({
                    id: `custom-${r.id}`,
                    number: EXANI_QUESTIONS.length + idx + 1,
                    area: r.area,
                    difficulty: r.difficulty,
                    question: r.question,
                    options: Array.isArray(r.options) ? r.options : [],
                    correctIndex: Number(r.correct_index),
                    explanation: r.explanation,
                    source: 'custom',
                }));
            }
        }

        const allQuestions = [...customQuestions, ...EXANI_QUESTIONS];
        return NextResponse.json({
            total: allQuestions.length,
            baseCount: EXANI_QUESTIONS.length,
            customCount: customQuestions.length,
            questions: allQuestions,
        });
    } catch (error) {
        console.error('[Questions GET]', error);
        return NextResponse.json({
            total: EXANI_QUESTIONS.length,
            baseCount: EXANI_QUESTIONS.length,
            customCount: 0,
            questions: EXANI_QUESTIONS,
        });
    }
}
