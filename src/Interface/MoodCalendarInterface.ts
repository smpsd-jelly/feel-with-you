export interface CreateResp {
    createMoodCalendarByDay: {
        id: number;
        mood_date: string;
        mood: { id: number; name: string; img_url: string };
        user: { id: number; email: string };
    };
}

export interface UpdateResp {
    createMoodCalendarByDay: {
        id: number;
        mood_date: string;
        mood: { id: number; name: string; img_url: string };
        user: { id: number; email: string };
    };
}

export interface CreateVars {
    input: {
        user_id: number;
        mood_id: number;
        mood_date?: string
    };
}

export interface MoodData {
    getMoodByName: { id: number; name: string; img_url: string };
}