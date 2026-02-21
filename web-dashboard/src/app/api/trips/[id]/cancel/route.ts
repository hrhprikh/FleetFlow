import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// NOTE: Primary cancel flow is via server action cancelTrip() in app/actions.ts

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { error } = await supabase.rpc('cancel_trip', { target_trip_id: id });

        if (error) throw error;

        const { data: updatedTrip, error: fetchError } = await supabase
            .from('trips')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        return NextResponse.json(updatedTrip);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
