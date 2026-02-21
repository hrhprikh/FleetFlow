import 'package:flutter_fleetflow/core/errors/app_exception.dart';
import 'package:flutter_fleetflow/models/driver.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';
import 'package:flutter_fleetflow/models/trip.dart';
import 'package:flutter_fleetflow/models/vehicle.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class TripService {
  TripService(this._client);

  final SupabaseClient _client;

  Future<List<Trip>> fetchAssignedTrips(String authUserId) async {
    try {
      final driverId = await _resolveDriverIdForAuthUser(authUserId);
      if (driverId == null) {
        return [];
      }

      final response = await _client
          .from('trips')
          .select()
          .eq('driver_id', driverId)
          .order('created_at', ascending: false);

      return (response as List)
          .map((e) => Trip.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  Future<String?> _resolveDriverIdForAuthUser(String authUserId) async {
    final byId = await _trySingle('drivers', 'id', authUserId);
    if (byId != null) {
      return byId['id']?.toString();
    }

    final byUserId = await _trySingle('drivers', 'user_id', authUserId);
    if (byUserId != null) {
      return byUserId['id']?.toString();
    }

    final byProfileId = await _trySingle('drivers', 'profile_id', authUserId);
    if (byProfileId != null) {
      return byProfileId['id']?.toString();
    }

    return null;
  }

  Future<Map<String, dynamic>?> _trySingle(
    String table,
    String column,
    String value,
  ) async {
    try {
      final row = await _client.from(table).select().eq(column, value).maybeSingle();
      if (row == null) {
        return null;
      }
      return Map<String, dynamic>.from(row);
    } on PostgrestException {
      return null;
    }
  }

  Future<Trip> fetchTripById(String tripId) async {
    try {
      final response = await _client
          .from('trips')
          .select()
          .eq('id', tripId)
          .single();
      return Trip.fromJson(Map<String, dynamic>.from(response));
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  Future<Vehicle> fetchVehicleById(String vehicleId) async {
    try {
      final response = await _client
          .from('vehicles')
          .select()
          .eq('id', vehicleId)
          .single();
      return Vehicle.fromJson(Map<String, dynamic>.from(response));
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  Future<Driver> fetchDriverById(String driverId) async {
    try {
      final response = await _client
          .from('drivers')
          .select()
          .eq('id', driverId)
          .single();
      return Driver.fromJson(Map<String, dynamic>.from(response));
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  Future<void> startTrip({
    required Trip trip,
    required Driver driver,
    required Vehicle vehicle,
    required double startOdometer,
  }) async {
    if (driver.licenseExpiry.isBefore(DateTime.now())) {
      throw const AppException(
        'Driver license has expired. Cannot start trip.',
      );
    }
    if (vehicle.status != VehicleStatus.available) {
      throw const AppException('Vehicle is not available for this trip.');
    }
    if (vehicle.status == VehicleStatus.inShop) {
      throw const AppException('Vehicle is in shop. Trip cannot start.');
    }
    if (trip.status == TripStatus.onTrip ||
        trip.status == TripStatus.completed) {
      throw const AppException('Trip is already in progress or completed.');
    }
    if (trip.cargoWeight > vehicle.maxCapacity) {
      throw const AppException(
        'Cargo exceeds vehicle max capacity. Server validation would reject this trip.',
      );
    }

    final existingOnTrip = await _client
        .from('trips')
        .select('id')
        .eq('driver_id', driver.id)
        .eq('status', 'on_trip')
        .limit(1);

    if ((existingOnTrip as List).isNotEmpty) {
      throw const AppException(
        'Driver already has an active trip in progress.',
      );
    }

    try {
      await _tryDispatchTripRpc(tripId: trip.id);
      await _client
          .from('trips')
          .update({'start_odometer': startOdometer})
          .eq('id', trip.id);
      return;
    } on AppException catch (error) {
      if (!_isRpcUnavailable(error)) {
        rethrow;
      }
    } catch (_) {
      // fallback to direct writes when RPC is not yet deployed
    }

    try {
      await _client
          .from('trips')
          .update({'status': 'on_trip', 'start_odometer': startOdometer})
          .eq('id', trip.id);

      await _client
          .from('drivers')
          .update({'status': 'on_duty'})
          .eq('id', driver.id);

      await _client
          .from('vehicles')
          .update({'status': 'on_trip', 'current_odometer': startOdometer})
          .eq('id', vehicle.id);
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  Future<void> _tryDispatchTripRpc({required String tripId}) async {
    try {
      await _client.rpc('dispatch_trip', params: {'trip_id': tripId});
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  Future<void> endTrip({
    required Trip trip,
    required Driver driver,
    required Vehicle vehicle,
    required double endOdometer,
    String? deliveryProofUrl,
  }) async {
    if (endOdometer <= 0) {
      throw const AppException('Ending odometer is required.');
    }
    if (endOdometer < (trip.startOdometer ?? 0)) {
      throw const AppException(
        'End odometer cannot be less than start odometer.',
      );
    }

    try {
      await _tryCompleteTripRpc(
        tripId: trip.id,
        endOdometer: endOdometer,
        revenue: 0,
      );
      return;
    } on AppException catch (error) {
      if (!_isRpcUnavailable(error)) {
        rethrow;
      }
    } catch (_) {
      // fallback to direct writes when RPC is not yet deployed
    }

    try {
      await _client
          .from('trips')
          .update({'status': 'completed', 'end_odometer': endOdometer})
          .eq('id', trip.id);

      await _client
          .from('drivers')
          .update({'status': 'off_duty'})
          .eq('id', driver.id);

      await _client
          .from('vehicles')
          .update({'status': 'available', 'current_odometer': endOdometer})
          .eq('id', vehicle.id);
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  Future<void> _tryCompleteTripRpc({
    required String tripId,
    required double endOdometer,
    required num revenue,
  }) async {
    try {
      await _client.rpc(
        'complete_trip',
        params: {
          'trip_id': tripId,
          'end_odometer': endOdometer,
          'revenue': revenue,
        },
      );
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  bool _isRpcUnavailable(AppException error) {
    final message = error.message.toLowerCase();
    return message.contains('could not find the function') ||
        message.contains('function') && message.contains('does not exist') ||
        message.contains('not found');
  }
}
