import 'package:flutter_fleetflow/core/errors/app_exception.dart';
import 'package:flutter_fleetflow/models/dashboard_data.dart';
import 'package:flutter_fleetflow/models/driver.dart';
import 'package:flutter_fleetflow/models/trip.dart';
import 'package:flutter_fleetflow/models/vehicle.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardService {
  DashboardService(this._client);

  final SupabaseClient _client;

  Future<DashboardData> getDashboardData(String authUserId) async {
    try {
      final driverMap = await _resolveDriverForAuthUser(authUserId);
      if (driverMap == null) {
        return const DashboardData();
      }
      final driver = Driver.fromJson(driverMap);

      final tripsRaw = await _client
          .from('trips')
          .select()
          .eq('driver_id', driver.id)
          .order('created_at', ascending: false)
          .limit(10);

      final trips = (tripsRaw as List)
          .map((e) => Trip.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();

      Vehicle? assignedVehicle;
      final activeTrips = trips
          .where((trip) => trip.status == TripStatus.onTrip)
          .toList();
      final activeTrip = activeTrips.isNotEmpty ? activeTrips.first : null;
      if (activeTrip != null) {
        final vehicleMap = await _client
            .from('vehicles')
            .select()
            .eq('id', activeTrip.vehicleId)
            .single();
        assignedVehicle = Vehicle.fromJson(
          Map<String, dynamic>.from(vehicleMap),
        );
      }

      final today = DateTime.now();
      final todaysTrips = trips
          .where(
            (trip) =>
                trip.createdAt.year == today.year &&
                trip.createdAt.month == today.month &&
                trip.createdAt.day == today.day,
          )
          .toList();

      final daysToExpiry = driver.licenseExpiry.difference(today).inDays;

      return DashboardData(
        driver: driver,
        assignedVehicle: assignedVehicle,
        todaysTrips: todaysTrips,
        licenseExpiringSoon: daysToExpiry <= 30,
      );
    } on PostgrestException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  Future<Map<String, dynamic>?> _resolveDriverForAuthUser(String authUserId) async {
    final byId = await _trySingle('drivers', 'id', authUserId);
    if (byId != null) {
      return byId;
    }

    final byUserId = await _trySingle('drivers', 'user_id', authUserId);
    if (byUserId != null) {
      return byUserId;
    }

    final byProfileId = await _trySingle('drivers', 'profile_id', authUserId);
    if (byProfileId != null) {
      return byProfileId;
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
}
