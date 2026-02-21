import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class LocalNotificationService {
  LocalNotificationService(this._plugin);

  final FlutterLocalNotificationsPlugin _plugin;

  Future<void> initialize() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const settings = InitializationSettings(android: android);
    await _plugin.initialize(settings);
  }

  Future<void> showSimple({
    required int id,
    required String title,
    required String body,
  }) async {
    const details = NotificationDetails(
      android: AndroidNotificationDetails(
        'fleetflow_updates',
        'FleetFlow Updates',
        importance: Importance.high,
        priority: Priority.high,
      ),
    );

    await _plugin.show(id, title, body, details);
  }
}
