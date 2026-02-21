// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TripImpl _$$TripImplFromJson(Map<String, dynamic> json) => _$TripImpl(
  id: json['id'] as String,
  driverId: json['driver_id'] as String,
  vehicleId: json['vehicle_id'] as String,
  cargoWeight: (json['cargo_weight'] as num).toDouble(),
  origin: json['origin'] as String,
  destination: json['destination'] as String,
  status: $enumDecode(_$TripStatusEnumMap, json['status']),
  startOdometer: (json['start_odometer'] as num?)?.toDouble(),
  endOdometer: (json['end_odometer'] as num?)?.toDouble(),
  createdAt: DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$$TripImplToJson(_$TripImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'driver_id': instance.driverId,
      'vehicle_id': instance.vehicleId,
      'cargo_weight': instance.cargoWeight,
      'origin': instance.origin,
      'destination': instance.destination,
      'status': _$TripStatusEnumMap[instance.status]!,
      'start_odometer': instance.startOdometer,
      'end_odometer': instance.endOdometer,
      'created_at': instance.createdAt.toIso8601String(),
    };

const _$TripStatusEnumMap = {
  TripStatus.draft: 'draft',
  TripStatus.dispatched: 'dispatched',
  TripStatus.onTrip: 'on_trip',
  TripStatus.completed: 'completed',
  TripStatus.cancelled: 'cancelled',
};
