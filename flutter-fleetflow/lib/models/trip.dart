import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';

part 'trip.freezed.dart';
part 'trip.g.dart';

@freezed
class Trip with _$Trip {
  const factory Trip({
    required String id,
    required String driverId,
    required String vehicleId,
    required double cargoWeight,
    required String origin,
    required String destination,
    required TripStatus status,
    double? startOdometer,
    double? endOdometer,
    required DateTime createdAt,
  }) = _Trip;

  factory Trip.fromJson(Map<String, dynamic> json) => _$TripFromJson(json);
}
