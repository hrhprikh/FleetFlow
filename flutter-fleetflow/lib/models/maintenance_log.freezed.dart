// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'maintenance_log.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

MaintenanceLog _$MaintenanceLogFromJson(Map<String, dynamic> json) {
  return _MaintenanceLog.fromJson(json);
}

/// @nodoc
mixin _$MaintenanceLog {
  String get id => throw _privateConstructorUsedError;
  String get vehicleId => throw _privateConstructorUsedError;
  MaintenanceServiceType get serviceType => throw _privateConstructorUsedError;
  double? get cost => throw _privateConstructorUsedError;
  DateTime get serviceDate => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  String? get issuePhotoUrl => throw _privateConstructorUsedError;

  /// Serializes this MaintenanceLog to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MaintenanceLog
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MaintenanceLogCopyWith<MaintenanceLog> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MaintenanceLogCopyWith<$Res> {
  factory $MaintenanceLogCopyWith(
    MaintenanceLog value,
    $Res Function(MaintenanceLog) then,
  ) = _$MaintenanceLogCopyWithImpl<$Res, MaintenanceLog>;
  @useResult
  $Res call({
    String id,
    String vehicleId,
    MaintenanceServiceType serviceType,
    double? cost,
    DateTime serviceDate,
    String? notes,
    String? issuePhotoUrl,
  });
}

/// @nodoc
class _$MaintenanceLogCopyWithImpl<$Res, $Val extends MaintenanceLog>
    implements $MaintenanceLogCopyWith<$Res> {
  _$MaintenanceLogCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MaintenanceLog
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? vehicleId = null,
    Object? serviceType = null,
    Object? cost = freezed,
    Object? serviceDate = null,
    Object? notes = freezed,
    Object? issuePhotoUrl = freezed,
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
            serviceType: null == serviceType
                ? _value.serviceType
                : serviceType // ignore: cast_nullable_to_non_nullable
                      as MaintenanceServiceType,
            cost: freezed == cost
                ? _value.cost
                : cost // ignore: cast_nullable_to_non_nullable
                      as double?,
            serviceDate: null == serviceDate
                ? _value.serviceDate
                : serviceDate // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
            issuePhotoUrl: freezed == issuePhotoUrl
                ? _value.issuePhotoUrl
                : issuePhotoUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MaintenanceLogImplCopyWith<$Res>
    implements $MaintenanceLogCopyWith<$Res> {
  factory _$$MaintenanceLogImplCopyWith(
    _$MaintenanceLogImpl value,
    $Res Function(_$MaintenanceLogImpl) then,
  ) = __$$MaintenanceLogImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String vehicleId,
    MaintenanceServiceType serviceType,
    double? cost,
    DateTime serviceDate,
    String? notes,
    String? issuePhotoUrl,
  });
}

/// @nodoc
class __$$MaintenanceLogImplCopyWithImpl<$Res>
    extends _$MaintenanceLogCopyWithImpl<$Res, _$MaintenanceLogImpl>
    implements _$$MaintenanceLogImplCopyWith<$Res> {
  __$$MaintenanceLogImplCopyWithImpl(
    _$MaintenanceLogImpl _value,
    $Res Function(_$MaintenanceLogImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MaintenanceLog
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? vehicleId = null,
    Object? serviceType = null,
    Object? cost = freezed,
    Object? serviceDate = null,
    Object? notes = freezed,
    Object? issuePhotoUrl = freezed,
  }) {
    return _then(
      _$MaintenanceLogImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        vehicleId: null == vehicleId
            ? _value.vehicleId
            : vehicleId // ignore: cast_nullable_to_non_nullable
                  as String,
        serviceType: null == serviceType
            ? _value.serviceType
            : serviceType // ignore: cast_nullable_to_non_nullable
                  as MaintenanceServiceType,
        cost: freezed == cost
            ? _value.cost
            : cost // ignore: cast_nullable_to_non_nullable
                  as double?,
        serviceDate: null == serviceDate
            ? _value.serviceDate
            : serviceDate // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
        issuePhotoUrl: freezed == issuePhotoUrl
            ? _value.issuePhotoUrl
            : issuePhotoUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MaintenanceLogImpl implements _MaintenanceLog {
  const _$MaintenanceLogImpl({
    required this.id,
    required this.vehicleId,
    required this.serviceType,
    this.cost,
    required this.serviceDate,
    this.notes,
    this.issuePhotoUrl,
  });

  factory _$MaintenanceLogImpl.fromJson(Map<String, dynamic> json) =>
      _$$MaintenanceLogImplFromJson(json);

  @override
  final String id;
  @override
  final String vehicleId;
  @override
  final MaintenanceServiceType serviceType;
  @override
  final double? cost;
  @override
  final DateTime serviceDate;
  @override
  final String? notes;
  @override
  final String? issuePhotoUrl;

  @override
  String toString() {
    return 'MaintenanceLog(id: $id, vehicleId: $vehicleId, serviceType: $serviceType, cost: $cost, serviceDate: $serviceDate, notes: $notes, issuePhotoUrl: $issuePhotoUrl)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MaintenanceLogImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.vehicleId, vehicleId) ||
                other.vehicleId == vehicleId) &&
            (identical(other.serviceType, serviceType) ||
                other.serviceType == serviceType) &&
            (identical(other.cost, cost) || other.cost == cost) &&
            (identical(other.serviceDate, serviceDate) ||
                other.serviceDate == serviceDate) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.issuePhotoUrl, issuePhotoUrl) ||
                other.issuePhotoUrl == issuePhotoUrl));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    vehicleId,
    serviceType,
    cost,
    serviceDate,
    notes,
    issuePhotoUrl,
  );

  /// Create a copy of MaintenanceLog
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MaintenanceLogImplCopyWith<_$MaintenanceLogImpl> get copyWith =>
      __$$MaintenanceLogImplCopyWithImpl<_$MaintenanceLogImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$MaintenanceLogImplToJson(this);
  }
}

abstract class _MaintenanceLog implements MaintenanceLog {
  const factory _MaintenanceLog({
    required final String id,
    required final String vehicleId,
    required final MaintenanceServiceType serviceType,
    final double? cost,
    required final DateTime serviceDate,
    final String? notes,
    final String? issuePhotoUrl,
  }) = _$MaintenanceLogImpl;

  factory _MaintenanceLog.fromJson(Map<String, dynamic> json) =
      _$MaintenanceLogImpl.fromJson;

  @override
  String get id;
  @override
  String get vehicleId;
  @override
  MaintenanceServiceType get serviceType;
  @override
  double? get cost;
  @override
  DateTime get serviceDate;
  @override
  String? get notes;
  @override
  String? get issuePhotoUrl;

  /// Create a copy of MaintenanceLog
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MaintenanceLogImplCopyWith<_$MaintenanceLogImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
