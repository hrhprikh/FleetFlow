import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/core/errors/app_exception.dart';
import 'package:flutter_fleetflow/models/trip.dart';
import 'package:flutter_fleetflow/providers/auth_provider.dart';
import 'package:flutter_fleetflow/providers/dashboard_provider.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';

final tripsProvider = FutureProvider<List<Trip>>((ref) async {
  final session = ref.watch(currentSessionProvider);
  final userId = session?.user.id;
  if (userId == null) {
    return [];
  }
  return ref.watch(tripServiceProvider).fetchAssignedTrips(userId);
});

final tripByIdProvider = FutureProvider.family<Trip, String>((
  ref,
  tripId,
) async {
  return ref.watch(tripServiceProvider).fetchTripById(tripId);
});

class TripActionController extends StateNotifier<AsyncValue<void>> {
  TripActionController(this._ref) : super(const AsyncValue.data(null));

  final Ref _ref;

  Future<void> startTrip({
    required Trip trip,
    required double startOdometer,
  }) async {
    state = const AsyncValue.loading();
    try {
      final service = _ref.read(tripServiceProvider);
      final driver = await service.fetchDriverById(trip.driverId);
      final vehicle = await service.fetchVehicleById(trip.vehicleId);
      await service.startTrip(
        trip: trip,
        driver: driver,
        vehicle: vehicle,
        startOdometer: startOdometer,
      );
      _refresh();
      state = const AsyncValue.data(null);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
      rethrow;
    }
  }

  Future<void> endTrip({
    required Trip trip,
    required double endOdometer,
    File? deliveryProof,
  }) async {
    state = const AsyncValue.loading();
    try {
      final service = _ref.read(tripServiceProvider);
      final driver = await service.fetchDriverById(trip.driverId);
      final vehicle = await service.fetchVehicleById(trip.vehicleId);

      String? proofUrl;
      if (deliveryProof != null) {
        proofUrl = await _ref
            .read(storageServiceProvider)
            .uploadDeliveryProof(file: deliveryProof, tripId: trip.id);
      }

      await service.endTrip(
        trip: trip,
        driver: driver,
        vehicle: vehicle,
        endOdometer: endOdometer,
        deliveryProofUrl: proofUrl,
      );

      _refresh();
      state = const AsyncValue.data(null);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
      if (error is AppException) {
        rethrow;
      }
      rethrow;
    }
  }

  void _refresh() {
    _ref.invalidate(tripsProvider);
    _ref.invalidate(dashboardProvider);
  }
}

final tripActionProvider =
    StateNotifierProvider<TripActionController, AsyncValue<void>>((ref) {
      return TripActionController(ref);
    });
