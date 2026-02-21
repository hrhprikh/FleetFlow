import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// NOTE: Primary dispatch flow is via server action dispatchTrip() in app/actions.ts
// This API route is kept for backward compatibility / external integrations.

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { error } = await supabase.rpc('dispatch_trip', { target_trip_id: id });

        if (error) {
            if (error.message.includes('not in Draft')) {
                return NextResponse.json({ error: 'Trip must be in Draft status to dispatch' }, { status: 400 });
            }
            if (error.message.includes('not currently Available')) {
                return NextResponse.json({ error: 'Vehicle is no longer Available' }, { status: 400 });
            }
            throw error;
        }

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
