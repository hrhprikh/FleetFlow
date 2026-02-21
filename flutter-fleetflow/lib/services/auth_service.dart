import 'package:flutter_fleetflow/core/errors/app_exception.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  AuthService(this._client);

  final SupabaseClient _client;

  Session? get currentSession => _client.auth.currentSession;

  Stream<AuthState> authStateChanges() => _client.auth.onAuthStateChange;

  Future<String?> getCurrentRole() async {
    final user = _client.auth.currentUser;
    if (user == null) {
      return null;
    }

    final metadataRole = user.userMetadata?['role']?.toString();

    try {
      final profile = await _client
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

      final profileRole = profile?['role']?.toString();
      return profileRole ?? metadataRole ?? 'dispatcher';
    } on PostgrestException {
      return metadataRole ?? 'dispatcher';
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    try {
      await _client.auth.signInWithPassword(email: email, password: password);
    } on AuthException catch (error) {
      throw AppException(error.message, details: error);
    }
  }

  Future<void> signOut() async {
    try {
      await _client.auth.signOut();
    } on AuthException catch (error) {
      throw AppException(error.message, details: error);
    }
  }
}
