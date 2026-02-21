import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // We can do this with two parallel queries or a Postgres function. 
        // Two parallel queries is simple enough and perfectly fine for this scale:
        const [fuelRes, maintenanceRes, vehicleRes] = await Promise.all([
            supabase.from('fuel_logs').select('cost').eq('vehicle_id', id),
            supabase.from('maintenance_logs').select('cost').eq('vehicle_id', id),
            supabase.from('vehicles').select('acquisition_cost').eq('id', id).single()
        ]);

        if (fuelRes.error) throw fuelRes.error;
        if (maintenanceRes.error) throw maintenanceRes.error;
        if (vehicleRes.error) throw vehicleRes.error;

        const fuel_total = fuelRes.data.reduce((sum, log) => sum + Number(log.cost || 0), 0);
        const maintenance_total = maintenanceRes.data.reduce((sum, log) => sum + Number(log.cost || 0), 0);
        const operational_total = fuel_total + maintenance_total;

        return NextResponse.json({
            vehicle_id: id,
            acquisition_cost: Number(vehicleRes.data.acquisition_cost || 0),
            fuel_total,
            maintenance_total,
            operational_total
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
