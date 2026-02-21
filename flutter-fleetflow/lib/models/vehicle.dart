import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';

part 'vehicle.freezed.dart';
part 'vehicle.g.dart';

@freezed
class Vehicle with _$Vehicle {
  const factory Vehicle({
    required String id,
    required String licensePlate,
    required String model,
    required double maxCapacity,
    required double currentOdometer,
    required VehicleStatus status,
  }) = _Vehicle;

  factory Vehicle.fromJson(Map<String, dynamic> json) =>
      _$VehicleFromJson(json);
}
