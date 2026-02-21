import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/models/dashboard_data.dart';
import 'package:flutter_fleetflow/providers/auth_provider.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';

final dashboardProvider = FutureProvider<DashboardData>((ref) async {
  final session = ref.watch(currentSessionProvider);
  final userId = session?.user.id;
  if (userId == null) {
    return const DashboardData();
  }
  return ref.watch(dashboardServiceProvider).getDashboardData(userId);
});
