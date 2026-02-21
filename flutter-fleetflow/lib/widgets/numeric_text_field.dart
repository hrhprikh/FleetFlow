import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class NumericTextField extends StatelessWidget {
  const NumericTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.validator,
  });

  final TextEditingController controller;
  final String label;
  final String? hint;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
      decoration: InputDecoration(labelText: label, hintText: hint),
      validator: validator,
    );
  }
}
