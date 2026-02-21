import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData dark() {
    const seed = Color(0xFF3F8CFF);
    final scheme = ColorScheme.fromSeed(
      seedColor: seed,
      brightness: Brightness.dark,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: scheme,
      scaffoldBackgroundColor: const Color(0xFF0F1115),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: scheme.surfaceContainerHighest,
        contentTextStyle: TextStyle(color: scheme.onSurface),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
      ),
      cardTheme: CardThemeData(
        color: scheme.surfaceContainerLow,
        margin: const EdgeInsets.symmetric(vertical: 6),
      ),
    );
  }
}
