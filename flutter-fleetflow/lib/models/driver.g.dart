// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'driver.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$DriverImpl _$$DriverImplFromJson(Map<String, dynamic> json) => _$DriverImpl(
  id: json['id'] as String,
  name: json['name'] as String,
  licenseNumber: json['license_number'] as String,
  licenseExpiry: DateTime.parse(json['license_expiry'] as String),
  status: $enumDecode(_$DriverStatusEnumMap, json['status']),
  safetyScore: (json['safety_score'] as num).toDouble(),
);

Map<String, dynamic> _$$DriverImplToJson(_$DriverImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'license_number': instance.licenseNumber,
      'license_expiry': instance.licenseExpiry.toIso8601String(),
      'status': _$DriverStatusEnumMap[instance.status]!,
      'safety_score': instance.safetyScore,
    };

const _$DriverStatusEnumMap = {
  DriverStatus.onDuty: 'on_duty',
  DriverStatus.offDuty: 'off_duty',
  DriverStatus.suspended: 'suspended',
};
