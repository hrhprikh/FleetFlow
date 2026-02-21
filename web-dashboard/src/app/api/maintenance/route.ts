import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST mutations are handled by server actions in app/actions.ts

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const vehicle_id = searchParams.get('vehicle_id');

        let query = supabase
            .from('maintenance_logs')
            .select('*, vehicle:vehicles(plate, model)');

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (vehicle_id && vehicle_id !== 'all') {
            query = query.eq('vehicle_id', vehicle_id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
