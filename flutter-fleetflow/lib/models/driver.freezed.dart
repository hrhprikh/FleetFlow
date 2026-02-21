// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'driver.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Driver _$DriverFromJson(Map<String, dynamic> json) {
  return _Driver.fromJson(json);
}

/// @nodoc
mixin _$Driver {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get licenseNumber => throw _privateConstructorUsedError;
  DateTime get licenseExpiry => throw _privateConstructorUsedError;
  DriverStatus get status => throw _privateConstructorUsedError;
  double get safetyScore => throw _privateConstructorUsedError;

  /// Serializes this Driver to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Driver
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $DriverCopyWith<Driver> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DriverCopyWith<$Res> {
  factory $DriverCopyWith(Driver value, $Res Function(Driver) then) =
      _$DriverCopyWithImpl<$Res, Driver>;
  @useResult
  $Res call({
    String id,
    String name,
    String licenseNumber,
    DateTime licenseExpiry,
    DriverStatus status,
    double safetyScore,
  });
}

/// @nodoc
class _$DriverCopyWithImpl<$Res, $Val extends Driver>
    implements $DriverCopyWith<$Res> {
  _$DriverCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Driver
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? licenseNumber = null,
    Object? licenseExpiry = null,
    Object? status = null,
    Object? safetyScore = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            licenseNumber: null == licenseNumber
                ? _value.licenseNumber
                : licenseNumber // ignore: cast_nullable_to_non_nullable
                      as String,
            licenseExpiry: null == licenseExpiry
                ? _value.licenseExpiry
                : licenseExpiry // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as DriverStatus,
            safetyScore: null == safetyScore
                ? _value.safetyScore
                : safetyScore // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$DriverImplCopyWith<$Res> implements $DriverCopyWith<$Res> {
  factory _$$DriverImplCopyWith(
    _$DriverImpl value,
    $Res Function(_$DriverImpl) then,
  ) = __$$DriverImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    String licenseNumber,
    DateTime licenseExpiry,
    DriverStatus status,
    double safetyScore,
  });
}

/// @nodoc
class __$$DriverImplCopyWithImpl<$Res>
    extends _$DriverCopyWithImpl<$Res, _$DriverImpl>
    implements _$$DriverImplCopyWith<$Res> {
  __$$DriverImplCopyWithImpl(
    _$DriverImpl _value,
    $Res Function(_$DriverImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Driver
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? licenseNumber = null,
    Object? licenseExpiry = null,
    Object? status = null,
    Object? safetyScore = null,
  }) {
    return _then(
      _$DriverImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        licenseNumber: null == licenseNumber
            ? _value.licenseNumber
            : licenseNumber // ignore: cast_nullable_to_non_nullable
                  as String,
        licenseExpiry: null == licenseExpiry
            ? _value.licenseExpiry
            : licenseExpiry // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as DriverStatus,
        safetyScore: null == safetyScore
            ? _value.safetyScore
            : safetyScore // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$DriverImpl implements _Driver {
  const _$DriverImpl({
    required this.id,
    required this.name,
    required this.licenseNumber,
    required this.licenseExpiry,
    required this.status,
    required this.safetyScore,
  });

  factory _$DriverImpl.fromJson(Map<String, dynamic> json) =>
      _$$DriverImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String licenseNumber;
  @override
  final DateTime licenseExpiry;
  @override
  final DriverStatus status;
  @override
  final double safetyScore;

  @override
  String toString() {
    return 'Driver(id: $id, name: $name, licenseNumber: $licenseNumber, licenseExpiry: $licenseExpiry, status: $status, safetyScore: $safetyScore)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DriverImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.licenseNumber, licenseNumber) ||
                other.licenseNumber == licenseNumber) &&
            (identical(other.licenseExpiry, licenseExpiry) ||
                other.licenseExpiry == licenseExpiry) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.safetyScore, safetyScore) ||
                other.safetyScore == safetyScore));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    licenseNumber,
    licenseExpiry,
    status,
    safetyScore,
  );

  /// Create a copy of Driver
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DriverImplCopyWith<_$DriverImpl> get copyWith =>
      __$$DriverImplCopyWithImpl<_$DriverImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DriverImplToJson(this);
  }
}

abstract class _Driver implements Driver {
  const factory _Driver({
    required final String id,
    required final String name,
    required final String licenseNumber,
    required final DateTime licenseExpiry,
    required final DriverStatus status,
    required final double safetyScore,
  }) = _$DriverImpl;

  factory _Driver.fromJson(Map<String, dynamic> json) = _$DriverImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get licenseNumber;
  @override
  DateTime get licenseExpiry;
  @override
  DriverStatus get status;
  @override
  double get safetyScore;

  /// Create a copy of Driver
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DriverImplCopyWith<_$DriverImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
