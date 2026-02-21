import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class OfflineDraftService {
  OfflineDraftService(this._prefs);

  final SharedPreferences _prefs;

  Future<void> saveDraft(String key, Map<String, dynamic> payload) async {
    await _prefs.setString(key, jsonEncode(payload));
  }

  Map<String, dynamic>? readDraft(String key) {
    final value = _prefs.getString(key);
    if (value == null || value.isEmpty) {
      return null;
    }
    return jsonDecode(value) as Map<String, dynamic>;
  }

  Future<void> clearDraft(String key) async {
    await _prefs.remove(key);
  }
}
