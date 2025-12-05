import { RiasecType, Career, CAREERS_DB } from './vocational-data';

export interface TestResult {
    scores: Record<RiasecType, number>;
    topCodes: RiasecType[];
    suggestedCareers: Career[];
}

export function calculateRiasecScore(answers: Record<string, boolean>, questions: { id: string; type: RiasecType }[]): Record<RiasecType, number> {
    const scores: Record<RiasecType, number> = {
        R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
    };

    questions.forEach(q => {
        if (answers[q.id]) {
            scores[q.type] += 1;
        }
    });

    return scores;
}

export function getTopCodes(scores: Record<RiasecType, number>): RiasecType[] {
    return (Object.entries(scores) as [RiasecType, number][])
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3) // Top 3 codes
        .map(([code]) => code);
}

export function getSuggestedCareers(topCodes: RiasecType[]): Career[] {
    // Simple matching algorithm:
    // Career matches if its primary code is in the user's top 2 codes
    // OR if it matches at least 2 of the user's top 3 codes.

    return CAREERS_DB.filter(career => {
        const primaryMatch = topCodes.slice(0, 2).includes(career.codes[0]);
        const intersection = career.codes.filter(code => topCodes.includes(code));
        return primaryMatch || intersection.length >= 2;
    });
}
