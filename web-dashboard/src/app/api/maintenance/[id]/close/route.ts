import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// NOTE: Primary close flow is via server action closeMaintenance() in app/actions.ts

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // The trg_maintenance_update Postgres trigger auto-releases the vehicle.
        const { data, error } = await supabase
            .from('maintenance_logs')
            .update({
                status: 'Closed',
                closed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
