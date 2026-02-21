import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Fuel Efficiency = (Total km driven) / (Total Liters) per vehicle
        // For simplicity, we can fetch completed trips and fuel logs, then aggregate locally.

        const [tripsRes, fuelRes, vehiclesRes] = await Promise.all([
            supabase.from('trips').select('vehicle_id, start_odo, end_odo').eq('status', 'Completed'),
            supabase.from('fuel_logs').select('vehicle_id, liters, cost'),
            supabase.from('vehicles').select('id, plate, model')
        ]);

        if (tripsRes.error) throw tripsRes.error;
        if (fuelRes.error) throw fuelRes.error;
        if (vehiclesRes.error) throw vehiclesRes.error;

        // Aggregate distance by vehicle
        const distanceByVehicle: Record<string, number> = {};
        for (const trip of tripsRes.data || []) {
            const dist = (trip.end_odo || 0) - (trip.start_odo || 0);
            if (dist > 0) {
                distanceByVehicle[trip.vehicle_id] = (distanceByVehicle[trip.vehicle_id] || 0) + dist;
            }
        }

        // Aggregate fuel volume and cost by vehicle
        const fuelByVehicle: Record<string, { liters: number, cost: number }> = {};
        for (const log of fuelRes.data || []) {
            if (!fuelByVehicle[log.vehicle_id]) {
                fuelByVehicle[log.vehicle_id] = { liters: 0, cost: 0 };
            }
            fuelByVehicle[log.vehicle_id].liters += Number(log.liters || 0);
            fuelByVehicle[log.vehicle_id].cost += Number(log.cost || 0);
        }

        // Combine
        const efficiencyData = (vehiclesRes.data || []).map(vehicle => {
            const distance = distanceByVehicle[vehicle.id] || 0;
            const fuel = fuelByVehicle[vehicle.id] || { liters: 0, cost: 0 };

            let km_per_liter = 0;
            if (fuel.liters > 0) {
                km_per_liter = distance / fuel.liters;
            }

            return {
                vehicle_id: vehicle.id,
                plate: vehicle.plate,
                model: vehicle.model,
                distance_km: distance,
                fuel_liters: fuel.liters,
                fuel_cost: fuel.cost,
                km_per_liter: Number(km_per_liter.toFixed(2))
            };
        }).filter(data => data.distance_km > 0 || data.fuel_liters > 0);

        // Sort by efficiency descending
        efficiencyData.sort((a, b) => b.km_per_liter - a.km_per_liter);

        return NextResponse.json(efficiencyData);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
