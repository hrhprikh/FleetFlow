class AppConfig {
  static const _supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const _nextPublicSupabaseUrl = String.fromEnvironment(
    'NEXT_PUBLIC_SUPABASE_URL',
  );
  static const _supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const _nextPublicSupabaseAnonKey = String.fromEnvironment(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  );

  static String get supabaseUrl =>
      _supabaseUrl.trim().isNotEmpty ? _supabaseUrl : _nextPublicSupabaseUrl;

  static String get supabaseAnonKey =>
      _supabaseAnonKey.trim().isNotEmpty
          ? _supabaseAnonKey
          : _nextPublicSupabaseAnonKey;

  static bool get isConfigured =>
      supabaseUrl.trim().isNotEmpty && supabaseAnonKey.trim().isNotEmpty;
}
