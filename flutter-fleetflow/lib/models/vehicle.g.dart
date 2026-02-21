// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$VehicleImpl _$$VehicleImplFromJson(Map<String, dynamic> json) =>
    _$VehicleImpl(
      id: json['id'] as String,
      licensePlate: json['license_plate'] as String,
      model: json['model'] as String,
      maxCapacity: (json['max_capacity'] as num).toDouble(),
      currentOdometer: (json['current_odometer'] as num).toDouble(),
      status: $enumDecode(_$VehicleStatusEnumMap, json['status']),
    );

Map<String, dynamic> _$$VehicleImplToJson(_$VehicleImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'license_plate': instance.licensePlate,
      'model': instance.model,
      'max_capacity': instance.maxCapacity,
      'current_odometer': instance.currentOdometer,
      'status': _$VehicleStatusEnumMap[instance.status]!,
    };

const _$VehicleStatusEnumMap = {
  VehicleStatus.available: 'available',
  VehicleStatus.onTrip: 'on_trip',
  VehicleStatus.inShop: 'in_shop',
  VehicleStatus.outOfService: 'out_of_service',
};
