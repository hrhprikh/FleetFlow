import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Mutations are handled by server actions in app/actions.ts

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        let query = supabase.from('vehicles').select('*').eq('is_archived', false);

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (type && type !== 'all') {
            query = query.eq('type', type);
        }

        if (search) {
            query = query.or(`plate.ilike.%${search}%,model.ilike.%${search}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
