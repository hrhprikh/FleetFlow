import 'package:flutter_fleetflow/core/errors/app_exception.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class MaintenanceService {
  MaintenanceService(this._client);

  final SupabaseClient _client;

  Future<void> reportIssue({
    required String vehicleId,
    required MaintenanceServiceType serviceType,
    double? cost,
    String? notes,
    String? issuePhotoUrl,
  }) async {
    try {
      await _client.from('maintenance_logs').insert({
        'vehicle_id': vehicleId,
        'service_type': serviceType.name,
        'cost': cost,
        'service_date': DateTime.now().toIso8601String(),
        'notes': notes,
        'issue_photo_url': issuePhotoUrl,
      });

      await _client
          .from('vehicles')
          .update({'status': 'in_shop'})
          .eq('id', vehicleId);
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }
}
