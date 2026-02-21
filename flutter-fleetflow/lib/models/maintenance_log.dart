import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';

part 'maintenance_log.freezed.dart';
part 'maintenance_log.g.dart';

@freezed
class MaintenanceLog with _$MaintenanceLog {
  const factory MaintenanceLog({
    required String id,
    required String vehicleId,
    required MaintenanceServiceType serviceType,
    double? cost,
    required DateTime serviceDate,
    String? notes,
    String? issuePhotoUrl,
  }) = _MaintenanceLog;

  factory MaintenanceLog.fromJson(Map<String, dynamic> json) =>
      _$MaintenanceLogFromJson(json);
}
