import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_fleetflow/providers/trip_provider.dart';

class TripsPage extends ConsumerWidget {
  const TripsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tripsAsync = ref.watch(tripsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Assigned Trips')),
      body: tripsAsync.when(
        data: (trips) {
          if (trips.isEmpty) {
            return const Center(child: Text('No assigned trips found.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: trips.length,
            itemBuilder: (context, index) {
              final trip = trips[index];
              return Card(
                child: ListTile(
                  onTap: () => context.push('/trips/${trip.id}'),
                  title: Text('${trip.origin} → ${trip.destination}'),
                  subtitle: Text('Status: ${trip.status.name}'),
                  trailing: const Icon(Icons.chevron_right),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
      ),
    );
  }
}
