// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'trip.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Trip _$TripFromJson(Map<String, dynamic> json) {
  return _Trip.fromJson(json);
}

/// @nodoc
mixin _$Trip {
  String get id => throw _privateConstructorUsedError;
  String get driverId => throw _privateConstructorUsedError;
  String get vehicleId => throw _privateConstructorUsedError;
  double get cargoWeight => throw _privateConstructorUsedError;
  String get origin => throw _privateConstructorUsedError;
  String get destination => throw _privateConstructorUsedError;
  TripStatus get status => throw _privateConstructorUsedError;
  double? get startOdometer => throw _privateConstructorUsedError;
  double? get endOdometer => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;

  /// Serializes this Trip to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TripCopyWith<Trip> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TripCopyWith<$Res> {
  factory $TripCopyWith(Trip value, $Res Function(Trip) then) =
      _$TripCopyWithImpl<$Res, Trip>;
  @useResult
  $Res call({
    String id,
    String driverId,
    String vehicleId,
    double cargoWeight,
    String origin,
    String destination,
    TripStatus status,
    double? startOdometer,
    double? endOdometer,
    DateTime createdAt,
  });
}

/// @nodoc
class _$TripCopyWithImpl<$Res, $Val extends Trip>
    implements $TripCopyWith<$Res> {
  _$TripCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? driverId = null,
    Object? vehicleId = null,
    Object? cargoWeight = null,
    Object? origin = null,
    Object? destination = null,
    Object? status = null,
    Object? startOdometer = freezed,
    Object? endOdometer = freezed,
    Object? createdAt = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            driverId: null == driverId
                ? _value.driverId
                : driverId // ignore: cast_nullable_to_non_nullable
                      as String,
            vehicleId: null == vehicleId
                ? _value.vehicleId
                : vehicleId // ignore: cast_nullable_to_non_nullable
                      as String,
            cargoWeight: null == cargoWeight
                ? _value.cargoWeight
                : cargoWeight // ignore: cast_nullable_to_non_nullable
                      as double,
            origin: null == origin
                ? _value.origin
                : origin // ignore: cast_nullable_to_non_nullable
                      as String,
            destination: null == destination
                ? _value.destination
                : destination // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as TripStatus,
            startOdometer: freezed == startOdometer
                ? _value.startOdometer
                : startOdometer // ignore: cast_nullable_to_non_nullable
                      as double?,
            endOdometer: freezed == endOdometer
                ? _value.endOdometer
                : endOdometer // ignore: cast_nullable_to_non_nullable
                      as double?,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$TripImplCopyWith<$Res> implements $TripCopyWith<$Res> {
  factory _$$TripImplCopyWith(
    _$TripImpl value,
    $Res Function(_$TripImpl) then,
  ) = __$$TripImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String driverId,
    String vehicleId,
    double cargoWeight,
    String origin,
    String destination,
    TripStatus status,
    double? startOdometer,
    double? endOdometer,
    DateTime createdAt,
  });
}

/// @nodoc
class __$$TripImplCopyWithImpl<$Res>
    extends _$TripCopyWithImpl<$Res, _$TripImpl>
    implements _$$TripImplCopyWith<$Res> {
  __$$TripImplCopyWithImpl(_$TripImpl _value, $Res Function(_$TripImpl) _then)
    : super(_value, _then);

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? driverId = null,
    Object? vehicleId = null,
    Object? cargoWeight = null,
    Object? origin = null,
    Object? destination = null,
    Object? status = null,
    Object? startOdometer = freezed,
    Object? endOdometer = freezed,
    Object? createdAt = null,
  }) {
    return _then(
      _$TripImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        driverId: null == driverId
            ? _value.driverId
            : driverId // ignore: cast_nullable_to_non_nullable
                  as String,
        vehicleId: null == vehicleId
            ? _value.vehicleId
            : vehicleId // ignore: cast_nullable_to_non_nullable
                  as String,
        cargoWeight: null == cargoWeight
            ? _value.cargoWeight
            : cargoWeight // ignore: cast_nullable_to_non_nullable
                  as double,
        origin: null == origin
            ? _value.origin
            : origin // ignore: cast_nullable_to_non_nullable
                  as String,
        destination: null == destination
            ? _value.destination
            : destination // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as TripStatus,
        startOdometer: freezed == startOdometer
            ? _value.startOdometer
            : startOdometer // ignore: cast_nullable_to_non_nullable
                  as double?,
        endOdometer: freezed == endOdometer
            ? _value.endOdometer
            : endOdometer // ignore: cast_nullable_to_non_nullable
                  as double?,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$TripImpl implements _Trip {
  const _$TripImpl({
    required this.id,
    required this.driverId,
    required this.vehicleId,
    required this.cargoWeight,
    required this.origin,
    required this.destination,
    required this.status,
    this.startOdometer,
    this.endOdometer,
    required this.createdAt,
  });

  factory _$TripImpl.fromJson(Map<String, dynamic> json) =>
      _$$TripImplFromJson(json);

  @override
  final String id;
  @override
  final String driverId;
  @override
  final String vehicleId;
  @override
  final double cargoWeight;
  @override
  final String origin;
  @override
  final String destination;
  @override
  final TripStatus status;
  @override
  final double? startOdometer;
  @override
  final double? endOdometer;
  @override
  final DateTime createdAt;

  @override
  String toString() {
    return 'Trip(id: $id, driverId: $driverId, vehicleId: $vehicleId, cargoWeight: $cargoWeight, origin: $origin, destination: $destination, status: $status, startOdometer: $startOdometer, endOdometer: $endOdometer, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TripImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.driverId, driverId) ||
                other.driverId == driverId) &&
            (identical(other.vehicleId, vehicleId) ||
                other.vehicleId == vehicleId) &&
            (identical(other.cargoWeight, cargoWeight) ||
                other.cargoWeight == cargoWeight) &&
            (identical(other.origin, origin) || other.origin == origin) &&
            (identical(other.destination, destination) ||
                other.destination == destination) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.startOdometer, startOdometer) ||
                other.startOdometer == startOdometer) &&
            (identical(other.endOdometer, endOdometer) ||
                other.endOdometer == endOdometer) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    driverId,
    vehicleId,
    cargoWeight,
    origin,
    destination,
    status,
    startOdometer,
    endOdometer,
    createdAt,
  );

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TripImplCopyWith<_$TripImpl> get copyWith =>
      __$$TripImplCopyWithImpl<_$TripImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TripImplToJson(this);
  }
}

abstract class _Trip implements Trip {
  const factory _Trip({
    required final String id,
    required final String driverId,
    required final String vehicleId,
    required final double cargoWeight,
    required final String origin,
    required final String destination,
    required final TripStatus status,
    final double? startOdometer,
    final double? endOdometer,
    required final DateTime createdAt,
  }) = _$TripImpl;

  factory _Trip.fromJson(Map<String, dynamic> json) = _$TripImpl.fromJson;

  @override
  String get id;
  @override
  String get driverId;
  @override
  String get vehicleId;
  @override
  double get cargoWeight;
  @override
  String get origin;
  @override
  String get destination;
  @override
  TripStatus get status;
  @override
  double? get startOdometer;
  @override
  double? get endOdometer;
  @override
  DateTime get createdAt;

  /// Create a copy of Trip
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TripImplCopyWith<_$TripImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
