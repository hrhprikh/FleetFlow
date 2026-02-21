import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/providers/auth_provider.dart';
import 'package:flutter_fleetflow/providers/dashboard_provider.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';
import 'package:flutter_fleetflow/providers/trip_provider.dart';

final realtimeBindingProvider = Provider<void>((ref) {
  final session = ref.watch(currentSessionProvider);
  final userId = session?.user.id;
  if (userId == null) {
    return;
  }

  final channel = ref
      .read(realtimeServiceProvider)
      .subscribeToDriverData(
        userId,
        onTripsChanged: () {
          ref.invalidate(tripsProvider);
          ref.invalidate(dashboardProvider);
        },
        onVehiclesChanged: () {
          ref.invalidate(dashboardProvider);
        },
        onMaintenanceChanged: () {
          ref.invalidate(dashboardProvider);
        },
      );

  ref.onDispose(() {
    ref.read(realtimeServiceProvider).unsubscribe(channel);
  });
});
