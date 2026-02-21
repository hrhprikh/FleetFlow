import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/app/app.dart';
import 'package:flutter_fleetflow/core/config/app_config.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (AppConfig.isConfigured) {
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      anonKey: AppConfig.supabaseAnonKey,
      authOptions: const FlutterAuthClientOptions(
        authFlowType: AuthFlowType.pkce,
      ),
    );
  }

  runApp(
    ProviderScope(
      child: AppConfig.isConfigured
          ? const FleetFlowApp()
          : const _ConfigMissingApp(),
    ),
  );
}

class _ConfigMissingApp extends StatelessWidget {
  const _ConfigMissingApp();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(brightness: Brightness.dark, useMaterial3: true),
      home: const Scaffold(
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(20),
            child: Text(
              'Missing SUPABASE_URL or SUPABASE_ANON_KEY.\nRun with --dart-define values.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}
