import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';
import 'package:flutter_fleetflow/providers/trip_provider.dart';

class TripDetailPage extends ConsumerWidget {
  const TripDetailPage({super.key, required this.tripId});

  final String tripId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tripAsync = ref.watch(tripByIdProvider(tripId));

    return Scaffold(
      appBar: AppBar(title: const Text('Trip Details')),
      body: tripAsync.when(
        data: (trip) {
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: ListTile(
                  title: Text('${trip.origin} → ${trip.destination}'),
                  subtitle: Text('Cargo: ${trip.cargoWeight} kg'),
                ),
              ),
              Card(
                child: ListTile(
                  title: const Text('Status'),
                  subtitle: Text(trip.status.name),
                ),
              ),
              Card(
                child: ListTile(
                  title: const Text('Start Odometer'),
                  subtitle: Text('${trip.startOdometer ?? '-'}'),
                ),
              ),
              Card(
                child: ListTile(
                  title: const Text('End Odometer'),
                  subtitle: Text('${trip.endOdometer ?? '-'}'),
                ),
              ),
              const SizedBox(height: 8),
              if (trip.status == TripStatus.dispatched)
                FilledButton.icon(
                  onPressed: () => context.push('/trips/$tripId/start'),
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Start Trip'),
                ),
              if (trip.status == TripStatus.onTrip)
                FilledButton.icon(
                  onPressed: () => context.push('/trips/$tripId/end'),
                  icon: const Icon(Icons.stop_circle_outlined),
                  label: const Text('End Trip'),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
      ),
    );
  }
}
