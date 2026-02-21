import 'package:flutter_fleetflow/core/errors/app_exception.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class FuelService {
  FuelService(this._client);

  final SupabaseClient _client;

  Future<void> createFuelLog({
    required String vehicleId,
    String? tripId,
    required double liters,
    required double amount,
    String? notes,
    String? receiptUrl,
  }) async {
    if (liters <= 0 || amount <= 0) {
      throw const AppException(
        'Fuel liters and amount must be greater than zero.',
      );
    }

    try {
      await _client.from('fuel_expenses').insert({
        'vehicle_id': vehicleId,
        'trip_id': tripId,
        'liters': liters,
        'amount': amount,
        'log_date': DateTime.now().toIso8601String(),
        'notes': notes,
        'receipt_url': receiptUrl,
      });
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }
}
