// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'fuel_expense.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

FuelExpense _$FuelExpenseFromJson(Map<String, dynamic> json) {
  return _FuelExpense.fromJson(json);
}

/// @nodoc
mixin _$FuelExpense {
  String get id => throw _privateConstructorUsedError;
  String get vehicleId => throw _privateConstructorUsedError;
  String? get tripId => throw _privateConstructorUsedError;
  double get liters => throw _privateConstructorUsedError;
  double get amount => throw _privateConstructorUsedError;
  DateTime get logDate => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  String? get receiptUrl => throw _privateConstructorUsedError;

  /// Serializes this FuelExpense to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FuelExpense
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FuelExpenseCopyWith<FuelExpense> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FuelExpenseCopyWith<$Res> {
  factory $FuelExpenseCopyWith(
    FuelExpense value,
    $Res Function(FuelExpense) then,
  ) = _$FuelExpenseCopyWithImpl<$Res, FuelExpense>;
  @useResult
  $Res call({
    String id,
    String vehicleId,
    String? tripId,
    double liters,
    double amount,
    DateTime logDate,
    String? notes,
    String? receiptUrl,
  });
}

/// @nodoc
class _$FuelExpenseCopyWithImpl<$Res, $Val extends FuelExpense>
    implements $FuelExpenseCopyWith<$Res> {
  _$FuelExpenseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FuelExpense
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? vehicleId = null,
    Object? tripId = freezed,
    Object? liters = null,
    Object? amount = null,
    Object? logDate = null,
    Object? notes = freezed,
    Object? receiptUrl = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            vehicleId: null == vehicleId
                ? _value.vehicleId
                : vehicleId // ignore: cast_nullable_to_non_nullable
                      as String,
            tripId: freezed == tripId
                ? _value.tripId
                : tripId // ignore: cast_nullable_to_non_nullable
                      as String?,
            liters: null == liters
                ? _value.liters
                : liters // ignore: cast_nullable_to_non_nullable
                      as double,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as double,
            logDate: null == logDate
                ? _value.logDate
                : logDate // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
            receiptUrl: freezed == receiptUrl
                ? _value.receiptUrl
                : receiptUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FuelExpenseImplCopyWith<$Res>
    implements $FuelExpenseCopyWith<$Res> {
  factory _$$FuelExpenseImplCopyWith(
    _$FuelExpenseImpl value,
    $Res Function(_$FuelExpenseImpl) then,
  ) = __$$FuelExpenseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String vehicleId,
    String? tripId,
    double liters,
    double amount,
    DateTime logDate,
    String? notes,
    String? receiptUrl,
  });
}

/// @nodoc
class __$$FuelExpenseImplCopyWithImpl<$Res>
    extends _$FuelExpenseCopyWithImpl<$Res, _$FuelExpenseImpl>
    implements _$$FuelExpenseImplCopyWith<$Res> {
  __$$FuelExpenseImplCopyWithImpl(
    _$FuelExpenseImpl _value,
    $Res Function(_$FuelExpenseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FuelExpense
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? vehicleId = null,
    Object? tripId = freezed,
    Object? liters = null,
    Object? amount = null,
    Object? logDate = null,
    Object? notes = freezed,
    Object? receiptUrl = freezed,
  }) {
    return _then(
      _$FuelExpenseImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        vehicleId: null == vehicleId
            ? _value.vehicleId
            : vehicleId // ignore: cast_nullable_to_non_nullable
                  as String,
        tripId: freezed == tripId
            ? _value.tripId
            : tripId // ignore: cast_nullable_to_non_nullable
                  as String?,
        liters: null == liters
            ? _value.liters
            : liters // ignore: cast_nullable_to_non_nullable
                  as double,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as double,
        logDate: null == logDate
            ? _value.logDate
            : logDate // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
        receiptUrl: freezed == receiptUrl
            ? _value.receiptUrl
            : receiptUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FuelExpenseImpl implements _FuelExpense {
  const _$FuelExpenseImpl({
    required this.id,
    required this.vehicleId,
    this.tripId,
    required this.liters,
    required this.amount,
    required this.logDate,
    this.notes,
    this.receiptUrl,
  });

  factory _$FuelExpenseImpl.fromJson(Map<String, dynamic> json) =>
      _$$FuelExpenseImplFromJson(json);

  @override
  final String id;
  @override
  final String vehicleId;
  @override
  final String? tripId;
  @override
  final double liters;
  @override
  final double amount;
  @override
  final DateTime logDate;
  @override
  final String? notes;
  @override
  final String? receiptUrl;

  @override
  String toString() {
    return 'FuelExpense(id: $id, vehicleId: $vehicleId, tripId: $tripId, liters: $liters, amount: $amount, logDate: $logDate, notes: $notes, receiptUrl: $receiptUrl)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FuelExpenseImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.vehicleId, vehicleId) ||
                other.vehicleId == vehicleId) &&
            (identical(other.tripId, tripId) || other.tripId == tripId) &&
            (identical(other.liters, liters) || other.liters == liters) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.logDate, logDate) || other.logDate == logDate) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.receiptUrl, receiptUrl) ||
                other.receiptUrl == receiptUrl));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    vehicleId,
    tripId,
    liters,
    amount,
    logDate,
    notes,
    receiptUrl,
  );

  /// Create a copy of FuelExpense
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FuelExpenseImplCopyWith<_$FuelExpenseImpl> get copyWith =>
      __$$FuelExpenseImplCopyWithImpl<_$FuelExpenseImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FuelExpenseImplToJson(this);
  }
}

abstract class _FuelExpense implements FuelExpense {
  const factory _FuelExpense({
    required final String id,
    required final String vehicleId,
    final String? tripId,
    required final double liters,
    required final double amount,
    required final DateTime logDate,
    final String? notes,
    final String? receiptUrl,
  }) = _$FuelExpenseImpl;

  factory _FuelExpense.fromJson(Map<String, dynamic> json) =
      _$FuelExpenseImpl.fromJson;

  @override
  String get id;
  @override
  String get vehicleId;
  @override
  String? get tripId;
  @override
  double get liters;
  @override
  double get amount;
  @override
  DateTime get logDate;
  @override
  String? get notes;
  @override
  String? get receiptUrl;

  /// Create a copy of FuelExpense
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FuelExpenseImplCopyWith<_$FuelExpenseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
