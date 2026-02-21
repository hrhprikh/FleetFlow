import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';
import 'package:flutter_fleetflow/providers/trip_provider.dart';
import 'package:flutter_fleetflow/widgets/numeric_text_field.dart';
import 'package:flutter_fleetflow/widgets/primary_button.dart';

class EndTripPage extends ConsumerStatefulWidget {
  const EndTripPage({super.key, required this.tripId});

  final String tripId;

  @override
  ConsumerState<EndTripPage> createState() => _EndTripPageState();
}

class _EndTripPageState extends ConsumerState<EndTripPage> {
  final _formKey = GlobalKey<FormState>();
  final _odometerController = TextEditingController();
  File? _deliveryProof;

  @override
  void dispose() {
    _odometerController.dispose();
    super.dispose();
  }

  Future<void> _pickProof() async {
    final mediaService = ref.read(mediaPickerServiceProvider);
    final selected = await mediaService.pickImage();
    setState(() => _deliveryProof = selected);
  }

  Future<void> _endTrip() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final odometer = double.parse(_odometerController.text);
    final trip = await ref.read(tripByIdProvider(widget.tripId).future);

    try {
      await ref
          .read(tripActionProvider.notifier)
          .endTrip(
            trip: trip,
            endOdometer: odometer,
            deliveryProof: _deliveryProof,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Trip completed successfully')),
        );
        context.pop();
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
    final state = ref.watch(tripActionProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('End Trip')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              NumericTextField(
                controller: _odometerController,
                label: 'End Odometer',
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'End odometer is required';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Enter a valid number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _pickProof,
                icon: const Icon(Icons.camera_alt_outlined),
                label: Text(
                  _deliveryProof == null
                      ? 'Add Delivery Proof (Optional)'
                      : 'Delivery proof selected',
                ),
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'Confirm End Trip',
                icon: Icons.stop_circle_outlined,
                isLoading: state.isLoading,
                onPressed: _endTrip,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
