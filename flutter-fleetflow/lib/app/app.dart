import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/app/router/app_router.dart';
import 'package:flutter_fleetflow/app/theme/app_theme.dart';

class FleetFlowApp extends ConsumerWidget {
  const FleetFlowApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);
    return MaterialApp.router(
      title: 'FleetFlow Driver',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: AppTheme.dark(),
      theme: AppTheme.dark(),
      routerConfig: router,
    );
  }
}
