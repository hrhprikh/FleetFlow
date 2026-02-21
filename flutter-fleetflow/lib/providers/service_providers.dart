import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/core/services/local_notification_service.dart';
import 'package:flutter_fleetflow/core/services/media_picker_service.dart';
import 'package:flutter_fleetflow/core/services/offline_draft_service.dart';
import 'package:flutter_fleetflow/core/supabase/supabase_providers.dart';
import 'package:flutter_fleetflow/services/auth_service.dart';
import 'package:flutter_fleetflow/services/dashboard_service.dart';
import 'package:flutter_fleetflow/services/fuel_service.dart';
import 'package:flutter_fleetflow/services/maintenance_service.dart';
import 'package:flutter_fleetflow/services/realtime_service.dart';
import 'package:flutter_fleetflow/services/storage_service.dart';
import 'package:flutter_fleetflow/services/trip_service.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.watch(supabaseClientProvider));
});

final dashboardServiceProvider = Provider<DashboardService>((ref) {
  return DashboardService(ref.watch(supabaseClientProvider));
});

final tripServiceProvider = Provider<TripService>((ref) {
  return TripService(ref.watch(supabaseClientProvider));
});

final fuelServiceProvider = Provider<FuelService>((ref) {
  return FuelService(ref.watch(supabaseClientProvider));
});

final maintenanceServiceProvider = Provider<MaintenanceService>((ref) {
  return MaintenanceService(ref.watch(supabaseClientProvider));
});

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService(ref.watch(supabaseClientProvider));
});

final realtimeServiceProvider = Provider<RealtimeService>((ref) {
  return RealtimeService(ref.watch(supabaseClientProvider));
});

final mediaPickerServiceProvider = Provider<MediaPickerService>((ref) {
  return MediaPickerService(ImagePicker());
});

final sharedPreferencesProvider = FutureProvider<SharedPreferences>((
  ref,
) async {
  return SharedPreferences.getInstance();
});

final offlineDraftServiceProvider = FutureProvider<OfflineDraftService>((
  ref,
) async {
  final prefs = await ref.watch(sharedPreferencesProvider.future);
  return OfflineDraftService(prefs);
});

final notificationServiceProvider = Provider<LocalNotificationService>((ref) {
  return LocalNotificationService(FlutterLocalNotificationsPlugin());
});
