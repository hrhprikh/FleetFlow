import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/providers/auth_provider.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';

class FuelLogController extends StateNotifier<AsyncValue<void>> {
  FuelLogController(this._ref) : super(const AsyncValue.data(null));

  final Ref _ref;

  static const _draftKey = 'fuel_log_draft';

  Future<void> submit({
    required String vehicleId,
    String? tripId,
    required double liters,
    required double amount,
    String? notes,
    File? receipt,
  }) async {
    state = const AsyncValue.loading();
    try {
      String? receiptUrl;
      if (receipt != null) {
        receiptUrl = await _ref
            .read(storageServiceProvider)
            .uploadReceipt(
              file: receipt,
              driverId: _ref.read(currentSessionIdProvider),
              tripId: tripId ?? 'general',
            );
      }

      await _ref
          .read(fuelServiceProvider)
          .createFuelLog(
            vehicleId: vehicleId,
            tripId: tripId,
            liters: liters,
            amount: amount,
            notes: notes,
            receiptUrl: receiptUrl,
          );

      final draftService = await _ref.read(offlineDraftServiceProvider.future);
      await draftService.clearDraft(_draftKey);
      state = const AsyncValue.data(null);
    } catch (error, stack) {
      final draftService = await _ref.read(offlineDraftServiceProvider.future);
      await draftService.saveDraft(_draftKey, {
        'vehicle_id': vehicleId,
        'trip_id': tripId,
        'liters': liters,
        'amount': amount,
        'notes': notes,
      });
      state = AsyncValue.error(error, stack);
      rethrow;
    }
  }
}

final currentSessionIdProvider = Provider<String>((ref) {
  final session = ref.watch(currentSessionProvider);
  return session?.user.id ?? '';
});

final fuelLogProvider =
    StateNotifierProvider<FuelLogController, AsyncValue<void>>((ref) {
      return FuelLogController(ref);
    });
