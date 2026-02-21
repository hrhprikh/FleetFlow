// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fuel_expense.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FuelExpenseImpl _$$FuelExpenseImplFromJson(Map<String, dynamic> json) =>
    _$FuelExpenseImpl(
      id: json['id'] as String,
      vehicleId: json['vehicle_id'] as String,
      tripId: json['trip_id'] as String?,
      liters: (json['liters'] as num).toDouble(),
      amount: (json['amount'] as num).toDouble(),
      logDate: DateTime.parse(json['log_date'] as String),
      notes: json['notes'] as String?,
      receiptUrl: json['receipt_url'] as String?,
    );

Map<String, dynamic> _$$FuelExpenseImplToJson(_$FuelExpenseImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'vehicle_id': instance.vehicleId,
      'trip_id': instance.tripId,
      'liters': instance.liters,
      'amount': instance.amount,
      'log_date': instance.logDate.toIso8601String(),
      'notes': instance.notes,
      'receipt_url': instance.receiptUrl,
    };
