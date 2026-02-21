import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_fleetflow/pages/dashboard_page.dart';
import 'package:flutter_fleetflow/pages/end_trip_page.dart';
import 'package:flutter_fleetflow/pages/fuel_log_page.dart';
import 'package:flutter_fleetflow/pages/login_page.dart';
import 'package:flutter_fleetflow/pages/maintenance_report_page.dart';
import 'package:flutter_fleetflow/pages/start_trip_page.dart';
import 'package:flutter_fleetflow/pages/trip_detail_page.dart';
import 'package:flutter_fleetflow/pages/trips_page.dart';
import 'package:flutter_fleetflow/providers/auth_provider.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  final authChanges = ref.watch(authServiceProvider).authStateChanges();

  return GoRouter(
    initialLocation: '/dashboard',
    refreshListenable: GoRouterRefreshStream(authChanges),
    redirect: (context, state) {
      final session = ref.read(currentSessionProvider);
      final roleState = ref.read(currentRoleProvider);
      final role = roleState.maybeWhen(data: (value) => value, orElse: () => null);
      final isLoggedIn = session != null;
      final onLogin = state.matchedLocation == '/login';

      if (!isLoggedIn && !onLogin) {
        return '/login';
      }
      if (isLoggedIn && onLogin) {
        return '/dashboard';
      }

      if (isLoggedIn && role != null && !_isAllowedForRole(role, state.matchedLocation)) {
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardPage(),
      ),
      GoRoute(path: '/trips', builder: (context, state) => const TripsPage()),
      GoRoute(
        path: '/trips/:tripId',
        builder: (context, state) =>
            TripDetailPage(tripId: state.pathParameters['tripId']!),
      ),
      GoRoute(
        path: '/trips/:tripId/start',
        builder: (context, state) =>
            StartTripPage(tripId: state.pathParameters['tripId']!),
      ),
      GoRoute(
        path: '/trips/:tripId/end',
        builder: (context, state) =>
            EndTripPage(tripId: state.pathParameters['tripId']!),
      ),
      GoRoute(path: '/fuel', builder: (context, state) => const FuelLogPage()),
      GoRoute(
        path: '/maintenance',
        builder: (context, state) => const MaintenanceReportPage(),
      ),
    ],
  );
});

bool _isAllowedForRole(String role, String path) {
  if (path == '/login' || path == '/dashboard') {
    return true;
  }

  if (role == 'manager') {
    return true;
  }

  if (path == '/trips' || path.startsWith('/trips/')) {
    return role == 'dispatcher';
  }

  if (path == '/maintenance') {
    return role == 'safety_officer' || role == 'manager';
  }

  if (path == '/fuel') {
    return role == 'financial' || role == 'manager' || role == 'dispatcher';
  }

  return false;
}

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
