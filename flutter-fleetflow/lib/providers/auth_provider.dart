import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/core/errors/app_exception.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final authStateStreamProvider = StreamProvider<AuthState>((ref) {
  return ref.watch(authServiceProvider).authStateChanges();
});

final currentSessionProvider = Provider<Session?>((ref) {
  ref.watch(authStateStreamProvider);
  return ref.watch(authServiceProvider).currentSession;
});

final currentRoleProvider = FutureProvider<String?>((ref) async {
  ref.watch(authStateStreamProvider);
  return ref.watch(authServiceProvider).getCurrentRole();
});

class AuthController extends StateNotifier<AsyncValue<void>> {
  AuthController(this._ref) : super(const AsyncValue.data(null));

  final Ref _ref;

  Future<void> signIn({required String email, required String password}) async {
    state = const AsyncValue.loading();
    try {
      await _ref
          .read(authServiceProvider)
          .signIn(email: email, password: password);
        _ref.invalidate(currentRoleProvider);
      state = const AsyncValue.data(null);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
      rethrow;
    }
  }

  Future<void> signOut() async {
    state = const AsyncValue.loading();
    try {
      await _ref.read(authServiceProvider).signOut();
      _ref.invalidate(currentRoleProvider);
      state = const AsyncValue.data(null);
    } catch (error, stack) {
      state = AsyncValue.error(error, stack);
      if (error is AppException) {
        rethrow;
      }
    }
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AsyncValue<void>>((ref) {
      return AuthController(ref);
    });
