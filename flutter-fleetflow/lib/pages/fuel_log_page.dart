import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/providers/fuel_provider.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';
import 'package:flutter_fleetflow/providers/trip_provider.dart';
import 'package:flutter_fleetflow/widgets/numeric_text_field.dart';
import 'package:flutter_fleetflow/widgets/primary_button.dart';

class FuelLogPage extends ConsumerStatefulWidget {
  const FuelLogPage({super.key});

  @override
  ConsumerState<FuelLogPage> createState() => _FuelLogPageState();
}

class _FuelLogPageState extends ConsumerState<FuelLogPage> {
  final _formKey = GlobalKey<FormState>();
  final _vehicleController = TextEditingController();
  final _litersController = TextEditingController();
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();
  String? _tripId;
  File? _receiptImage;

  @override
  void dispose() {
    _vehicleController.dispose();
    _litersController.dispose();
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickReceipt() async {
    final picked = await ref.read(mediaPickerServiceProvider).pickImage();
    setState(() => _receiptImage = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    try {
      await ref
          .read(fuelLogProvider.notifier)
          .submit(
            vehicleId: _vehicleController.text.trim(),
            tripId: _tripId,
            liters: double.parse(_litersController.text),
            amount: double.parse(_amountController.text),
            notes: _notesController.text.trim().isEmpty
                ? null
                : _notesController.text.trim(),
            receipt: _receiptImage,
          );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Fuel log added')));
        Navigator.of(context).pop();
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(error.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final tripsAsync = ref.watch(tripsProvider);
    final loading = ref.watch(fuelLogProvider).isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('Fuel Log')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _vehicleController,
                decoration: const InputDecoration(labelText: 'Vehicle ID'),
                validator: (value) => value == null || value.isEmpty
                    ? 'Vehicle ID is required'
                    : null,
              ),
              const SizedBox(height: 10),
              tripsAsync.when(
                data: (trips) => DropdownButtonFormField<String?>(
                  value: _tripId,
                  items: [
                    const DropdownMenuItem<String?>(
                      value: null,
                      child: Text('No trip linked'),
                    ),
                    ...trips.map(
                      (trip) => DropdownMenuItem<String?>(
                        value: trip.id,
                        child: Text('${trip.origin} → ${trip.destination}'),
                      ),
                    ),
                  ],
                  onChanged: (value) => setState(() => _tripId = value),
                  decoration: const InputDecoration(
                    labelText: 'Trip (Optional)',
                  ),
                ),
                loading: () => const LinearProgressIndicator(),
                error: (error, _) => Text('Trips load failed: $error'),
              ),
              const SizedBox(height: 10),
              NumericTextField(
                controller: _litersController,
                label: 'Fuel liters',
                validator: (value) =>
                    value == null || value.isEmpty ? 'Liters required' : null,
              ),
              const SizedBox(height: 10),
              NumericTextField(
                controller: _amountController,
                label: 'Amount',
                validator: (value) =>
                    value == null || value.isEmpty ? 'Amount required' : null,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _notesController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Notes'),
              ),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: _pickReceipt,
                icon: const Icon(Icons.receipt_long),
                label: Text(
                  _receiptImage == null
                      ? 'Add Receipt Image'
                      : 'Receipt image selected',
                ),
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'Submit Fuel Log',
                icon: Icons.local_gas_station,
                isLoading: loading,
                onPressed: _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
