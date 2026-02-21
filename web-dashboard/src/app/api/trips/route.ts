import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST and lifecycle mutations are handled by server actions in app/actions.ts

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');

        let query = supabase
            .from('trips')
            .select('*, vehicle:vehicles(plate, model), driver:drivers(name, license_no)');

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
