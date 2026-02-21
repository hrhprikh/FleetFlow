import 'dart:io';

import 'package:flutter_fleetflow/core/errors/app_exception.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class StorageService {
  StorageService(this._client);

  final SupabaseClient _client;

  Future<String> uploadReceipt({
    required File file,
    required String driverId,
    required String tripId,
  }) async {
    return _uploadFile(
      bucket: 'fuel-receipts',
      file: file,
      path: '$driverId/$tripId/${DateTime.now().millisecondsSinceEpoch}.jpg',
    );
  }

  Future<String> uploadMaintenanceMedia({
    required File file,
    required String vehicleId,
  }) async {
    return _uploadFile(
      bucket: 'maintenance-issues',
      file: file,
      path: '$vehicleId/${DateTime.now().millisecondsSinceEpoch}.jpg',
    );
  }

  Future<String> uploadDeliveryProof({
    required File file,
    required String tripId,
  }) async {
    return _uploadFile(
      bucket: 'trip-proofs',
      file: file,
      path: '$tripId/${DateTime.now().millisecondsSinceEpoch}.jpg',
    );
  }

  Future<String> _uploadFile({
    required String bucket,
    required File file,
    required String path,
  }) async {
    try {
      await _client.storage.from(bucket).upload(path, file);
      return _client.storage.from(bucket).getPublicUrl(path);
    } on StorageException catch (error) {
      throw AppException(error.message, details: error);
    }
  }
}
