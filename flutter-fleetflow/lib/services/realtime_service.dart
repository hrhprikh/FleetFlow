import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class RealtimeService {
  RealtimeService(this._client);

  final SupabaseClient _client;

  RealtimeChannel subscribeToDriverData(
    String driverId, {
    required VoidCallback onTripsChanged,
    required VoidCallback onVehiclesChanged,
    required VoidCallback onMaintenanceChanged,
  }) {
    final channel = _client.channel('public:driver:$driverId');

    channel
      ..onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'trips',
        callback: (_) => onTripsChanged(),
      )
      ..onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'vehicles',
        callback: (_) => onVehiclesChanged(),
      )
      ..onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'maintenance_logs',
        callback: (_) => onMaintenanceChanged(),
      )
      ..subscribe();

    return channel;
  }

  Future<void> unsubscribe(RealtimeChannel channel) async {
    await _client.removeChannel(channel);
  }
}
