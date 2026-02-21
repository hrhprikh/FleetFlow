import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_fleetflow/providers/trip_provider.dart';
import 'package:flutter_fleetflow/widgets/numeric_text_field.dart';
import 'package:flutter_fleetflow/widgets/primary_button.dart';

class StartTripPage extends ConsumerStatefulWidget {
  const StartTripPage({super.key, required this.tripId});

  final String tripId;

  @override
  ConsumerState<StartTripPage> createState() => _StartTripPageState();
}

class _StartTripPageState extends ConsumerState<StartTripPage> {
  final _formKey = GlobalKey<FormState>();
  final _odometerController = TextEditingController();

  @override
  void dispose() {
    _odometerController.dispose();
    super.dispose();
  }

  Future<void> _startTrip() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final odometer = double.parse(_odometerController.text);
    final trip = await ref.read(tripByIdProvider(widget.tripId).future);

    try {
      await ref
          .read(tripActionProvider.notifier)
          .startTrip(trip: trip, startOdometer: odometer);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Trip started successfully')),
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
      appBar: AppBar(title: const Text('Start Trip')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              NumericTextField(
                controller: _odometerController,
                label: 'Start Odometer',
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Start odometer is required';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Enter a valid number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'Confirm Start Trip',
                icon: Icons.play_arrow,
                isLoading: state.isLoading,
                onPressed: _startTrip,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
