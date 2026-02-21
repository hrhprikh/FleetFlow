import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';

part 'driver.freezed.dart';
part 'driver.g.dart';

@freezed
class Driver with _$Driver {
  const factory Driver({
    required String id,
    required String name,
    required String licenseNumber,
    required DateTime licenseExpiry,
    required DriverStatus status,
    required double safetyScore,
  }) = _Driver;

  factory Driver.fromJson(Map<String, dynamic> json) => _$DriverFromJson(json);
}
