import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';
import 'package:flutter_fleetflow/providers/dashboard_provider.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';

class MaintenanceController extends StateNotifier<AsyncValue<void>> {
  MaintenanceController(this._ref) : super(const AsyncValue.data(null));

  final Ref _ref;

  static const _draftKey = 'maintenance_draft';

  Future<void> submit({
    required String vehicleId,
    required MaintenanceServiceType serviceType,
    double? cost,
    String? notes,
    File? media,
  }) async {
    state = const AsyncValue.loading();
    try {
      String? mediaUrl;
      if (media != null) {
        mediaUrl = await _ref
            .read(storageServiceProvider)
            .uploadMaintenanceMedia(file: media, vehicleId: vehicleId);
      }

      await _ref
          .read(maintenanceServiceProvider)
          .reportIssue(
            vehicleId: vehicleId,
            serviceType: serviceType,
            cost: cost,
            notes: notes,
            issuePhotoUrl: mediaUrl,
          );

      final draftService = await _ref.read(offlineDraftServiceProvider.future);
      await draftService.clearDraft(_draftKey);
      _ref.invalidate(dashboardProvider);
      state = const AsyncValue.data(null);
    } catch (error, stack) {
      final draftService = await _ref.read(offlineDraftServiceProvider.future);
      await draftService.saveDraft(_draftKey, {
        'vehicle_id': vehicleId,
        'service_type': serviceType.name,
        'cost': cost,
        'notes': notes,
      });
      state = AsyncValue.error(error, stack);
      rethrow;
    }
  }
}

final maintenanceProvider =
    StateNotifierProvider<MaintenanceController, AsyncValue<void>>((ref) {
      return MaintenanceController(ref);
    });
