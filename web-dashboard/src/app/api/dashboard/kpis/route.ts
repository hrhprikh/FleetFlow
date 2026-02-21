import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Active Fleet (Vehicles 'On Trip')
        // 2. In Maintenance (Vehicles 'In Shop' or Maintenance Logs 'Open')
        // 3. Utilization Rate (On Trip / (Available + On Trip)) * 100
        // 4. Pending Trips (Trips 'Draft')

        const [vehiclesRes, pendingTripsRes] = await Promise.all([
            supabase.from('vehicles').select('status'),
            supabase.from('trips').select('id', { count: 'exact', head: true }).eq('status', 'Draft'),
        ]);

        if (vehiclesRes.error) throw vehiclesRes.error;
        if (pendingTripsRes.error) throw pendingTripsRes.error;

        const vehicles = vehiclesRes.data || [];
        const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
        const inMaintenance = vehicles.filter(v => v.status === 'In Shop').length;

        // Utilization rate
        const deployableVehicles = vehicles.filter(v => v.status === 'Available' || v.status === 'On Trip').length;
        let utilizationRate = 0;
        if (deployableVehicles > 0) {
            utilizationRate = Math.round((activeFleet / deployableVehicles) * 100);
        }

        const pendingTrips = pendingTripsRes.count || 0;

        return NextResponse.json({
            activeFleet,
            inMaintenance,
            utilizationRate,
            pendingTrips
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
