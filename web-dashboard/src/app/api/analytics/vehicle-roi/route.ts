import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost

        const [tripsRes, fuelRes, maintenanceRes, vehiclesRes] = await Promise.all([
            supabase.from('trips').select('vehicle_id, revenue').eq('status', 'Completed'),
            supabase.from('fuel_logs').select('vehicle_id, cost'),
            supabase.from('maintenance_logs').select('vehicle_id, cost'),
            supabase.from('vehicles').select('id, plate, model, acquisition_cost')
        ]);

        if (tripsRes.error) throw tripsRes.error;
        if (fuelRes.error) throw fuelRes.error;
        if (maintenanceRes.error) throw maintenanceRes.error;
        if (vehiclesRes.error) throw vehiclesRes.error;

        // Aggregate metrics
        const revenueByVehicle: Record<string, number> = {};
        for (const trip of tripsRes.data || []) {
            revenueByVehicle[trip.vehicle_id] = (revenueByVehicle[trip.vehicle_id] || 0) + Number(trip.revenue || 0);
        }

        const fuelCostByVehicle: Record<string, number> = {};
        for (const log of fuelRes.data || []) {
            fuelCostByVehicle[log.vehicle_id] = (fuelCostByVehicle[log.vehicle_id] || 0) + Number(log.cost || 0);
        }

        const maintenanceCostByVehicle: Record<string, number> = {};
        for (const log of maintenanceRes.data || []) {
            maintenanceCostByVehicle[log.vehicle_id] = (maintenanceCostByVehicle[log.vehicle_id] || 0) + Number(log.cost || 0);
        }

        const roiData = (vehiclesRes.data || []).map(vehicle => {
            const revenue = revenueByVehicle[vehicle.id] || 0;
            const fuelCost = fuelCostByVehicle[vehicle.id] || 0;
            const maintenanceCost = maintenanceCostByVehicle[vehicle.id] || 0;
            const totalExpenses = fuelCost + maintenanceCost;
            const netProfit = revenue - totalExpenses;
            const acquisitionCost = Number(vehicle.acquisition_cost || 0);

            let roi_percentage = 0;
            if (acquisitionCost > 0) {
                roi_percentage = (netProfit / acquisitionCost) * 100;
            }

            return {
                vehicle_id: vehicle.id,
                plate: vehicle.plate,
                model: vehicle.model,
                acquisition_cost: acquisitionCost,
                revenue,
                expenses: totalExpenses,
                net_profit: netProfit,
                roi_percentage: Number(roi_percentage.toFixed(2))
            };
        });

        // Sort by ROI descending
        roiData.sort((a, b) => b.roi_percentage - a.roi_percentage);

        return NextResponse.json(roiData);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
