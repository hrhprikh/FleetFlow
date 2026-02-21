import 'package:freezed_annotation/freezed_annotation.dart';

enum DriverStatus {
  @JsonValue('on_duty')
  onDuty,
  @JsonValue('off_duty')
  offDuty,
  @JsonValue('suspended')
  suspended,
}

enum VehicleStatus {
  @JsonValue('available')
  available,
  @JsonValue('on_trip')
  onTrip,
  @JsonValue('in_shop')
  inShop,
  @JsonValue('out_of_service')
  outOfService,
}

enum TripStatus {
  @JsonValue('draft')
  draft,
  @JsonValue('dispatched')
  dispatched,
  @JsonValue('on_trip')
  onTrip,
  @JsonValue('completed')
  completed,
  @JsonValue('cancelled')
  cancelled,
}

enum MaintenanceServiceType {
  @JsonValue('engine')
  engine,
  @JsonValue('tires')
  tires,
  @JsonValue('brakes')
  brakes,
  @JsonValue('electrical')
  electrical,
  @JsonValue('other')
  other,
}
