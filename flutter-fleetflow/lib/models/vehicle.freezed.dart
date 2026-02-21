// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'vehicle.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Vehicle _$VehicleFromJson(Map<String, dynamic> json) {
  return _Vehicle.fromJson(json);
}

/// @nodoc
mixin _$Vehicle {
  String get id => throw _privateConstructorUsedError;
  String get licensePlate => throw _privateConstructorUsedError;
  String get model => throw _privateConstructorUsedError;
  double get maxCapacity => throw _privateConstructorUsedError;
  double get currentOdometer => throw _privateConstructorUsedError;
  VehicleStatus get status => throw _privateConstructorUsedError;

  /// Serializes this Vehicle to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Vehicle
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $VehicleCopyWith<Vehicle> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $VehicleCopyWith<$Res> {
  factory $VehicleCopyWith(Vehicle value, $Res Function(Vehicle) then) =
      _$VehicleCopyWithImpl<$Res, Vehicle>;
  @useResult
  $Res call({
    String id,
    String licensePlate,
    String model,
    double maxCapacity,
    double currentOdometer,
    VehicleStatus status,
  });
}

/// @nodoc
class _$VehicleCopyWithImpl<$Res, $Val extends Vehicle>
    implements $VehicleCopyWith<$Res> {
  _$VehicleCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Vehicle
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? licensePlate = null,
    Object? model = null,
    Object? maxCapacity = null,
    Object? currentOdometer = null,
    Object? status = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            licensePlate: null == licensePlate
                ? _value.licensePlate
                : licensePlate // ignore: cast_nullable_to_non_nullable
                      as String,
            model: null == model
                ? _value.model
                : model // ignore: cast_nullable_to_non_nullable
                      as String,
            maxCapacity: null == maxCapacity
                ? _value.maxCapacity
                : maxCapacity // ignore: cast_nullable_to_non_nullable
                      as double,
            currentOdometer: null == currentOdometer
                ? _value.currentOdometer
                : currentOdometer // ignore: cast_nullable_to_non_nullable
                      as double,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as VehicleStatus,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$VehicleImplCopyWith<$Res> implements $VehicleCopyWith<$Res> {
  factory _$$VehicleImplCopyWith(
    _$VehicleImpl value,
    $Res Function(_$VehicleImpl) then,
  ) = __$$VehicleImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String licensePlate,
    String model,
    double maxCapacity,
    double currentOdometer,
    VehicleStatus status,
  });
}

/// @nodoc
class __$$VehicleImplCopyWithImpl<$Res>
    extends _$VehicleCopyWithImpl<$Res, _$VehicleImpl>
    implements _$$VehicleImplCopyWith<$Res> {
  __$$VehicleImplCopyWithImpl(
    _$VehicleImpl _value,
    $Res Function(_$VehicleImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Vehicle
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? licensePlate = null,
    Object? model = null,
    Object? maxCapacity = null,
    Object? currentOdometer = null,
    Object? status = null,
  }) {
    return _then(
      _$VehicleImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        licensePlate: null == licensePlate
            ? _value.licensePlate
            : licensePlate // ignore: cast_nullable_to_non_nullable
                  as String,
        model: null == model
            ? _value.model
            : model // ignore: cast_nullable_to_non_nullable
                  as String,
        maxCapacity: null == maxCapacity
            ? _value.maxCapacity
            : maxCapacity // ignore: cast_nullable_to_non_nullable
                  as double,
        currentOdometer: null == currentOdometer
            ? _value.currentOdometer
            : currentOdometer // ignore: cast_nullable_to_non_nullable
                  as double,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as VehicleStatus,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$VehicleImpl implements _Vehicle {
  const _$VehicleImpl({
    required this.id,
    required this.licensePlate,
    required this.model,
    required this.maxCapacity,
    required this.currentOdometer,
    required this.status,
  });

  factory _$VehicleImpl.fromJson(Map<String, dynamic> json) =>
      _$$VehicleImplFromJson(json);

  @override
  final String id;
  @override
  final String licensePlate;
  @override
  final String model;
  @override
  final double maxCapacity;
  @override
  final double currentOdometer;
  @override
  final VehicleStatus status;

  @override
  String toString() {
    return 'Vehicle(id: $id, licensePlate: $licensePlate, model: $model, maxCapacity: $maxCapacity, currentOdometer: $currentOdometer, status: $status)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$VehicleImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.licensePlate, licensePlate) ||
                other.licensePlate == licensePlate) &&
            (identical(other.model, model) || other.model == model) &&
            (identical(other.maxCapacity, maxCapacity) ||
                other.maxCapacity == maxCapacity) &&
            (identical(other.currentOdometer, currentOdometer) ||
                other.currentOdometer == currentOdometer) &&
            (identical(other.status, status) || other.status == status));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    licensePlate,
    model,
    maxCapacity,
    currentOdometer,
    status,
  );

  /// Create a copy of Vehicle
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$VehicleImplCopyWith<_$VehicleImpl> get copyWith =>
      __$$VehicleImplCopyWithImpl<_$VehicleImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$VehicleImplToJson(this);
  }
}

abstract class _Vehicle implements Vehicle {
  const factory _Vehicle({
    required final String id,
    required final String licensePlate,
    required final String model,
    required final double maxCapacity,
    required final double currentOdometer,
    required final VehicleStatus status,
  }) = _$VehicleImpl;

  factory _Vehicle.fromJson(Map<String, dynamic> json) = _$VehicleImpl.fromJson;

  @override
  String get id;
  @override
  String get licensePlate;
  @override
  String get model;
  @override
  double get maxCapacity;
  @override
  double get currentOdometer;
  @override
  VehicleStatus get status;

  /// Create a copy of Vehicle
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$VehicleImplCopyWith<_$VehicleImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
