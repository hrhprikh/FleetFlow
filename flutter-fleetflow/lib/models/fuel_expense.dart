import 'package:freezed_annotation/freezed_annotation.dart';

part 'fuel_expense.freezed.dart';
part 'fuel_expense.g.dart';

@freezed
class FuelExpense with _$FuelExpense {
  const factory FuelExpense({
    required String id,
    required String vehicleId,
    String? tripId,
    required double liters,
    required double amount,
    required DateTime logDate,
    String? notes,
    String? receiptUrl,
  }) = _FuelExpense;

  factory FuelExpense.fromJson(Map<String, dynamic> json) =>
      _$FuelExpenseFromJson(json);
}
