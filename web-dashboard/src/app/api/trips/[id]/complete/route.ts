import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// NOTE: Primary complete flow is via server action completeTrip() in app/actions.ts

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { id } = await params;

        if (body.final_odo === undefined) {
            return NextResponse.json({ error: 'final_odo is required to complete a trip' }, { status: 400 });
        }

        const { error } = await supabase.rpc('complete_trip', {
            target_trip_id: id,
            final_odo: Number(body.final_odo),
            trip_revenue: Number(body.revenue || 0)
        });

        if (error) {
            if (error.message.includes('not in Dispatched')) {
                return NextResponse.json({ error: 'Trip must be Dispatched to complete it' }, { status: 400 });
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
