// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'maintenance_log.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MaintenanceLogImpl _$$MaintenanceLogImplFromJson(Map<String, dynamic> json) =>
    _$MaintenanceLogImpl(
      id: json['id'] as String,
      vehicleId: json['vehicle_id'] as String,
      serviceType: $enumDecode(
        _$MaintenanceServiceTypeEnumMap,
        json['service_type'],
      ),
      cost: (json['cost'] as num?)?.toDouble(),
      serviceDate: DateTime.parse(json['service_date'] as String),
      notes: json['notes'] as String?,
      issuePhotoUrl: json['issue_photo_url'] as String?,
    );

Map<String, dynamic> _$$MaintenanceLogImplToJson(
  _$MaintenanceLogImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'vehicle_id': instance.vehicleId,
  'service_type': _$MaintenanceServiceTypeEnumMap[instance.serviceType]!,
  'cost': instance.cost,
  'service_date': instance.serviceDate.toIso8601String(),
  'notes': instance.notes,
  'issue_photo_url': instance.issuePhotoUrl,
};

const _$MaintenanceServiceTypeEnumMap = {
  MaintenanceServiceType.engine: 'engine',
  MaintenanceServiceType.tires: 'tires',
  MaintenanceServiceType.brakes: 'brakes',
  MaintenanceServiceType.electrical: 'electrical',
  MaintenanceServiceType.other: 'other',
};
