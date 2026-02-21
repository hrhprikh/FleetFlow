import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';
import 'package:flutter_fleetflow/providers/maintenance_provider.dart';
import 'package:flutter_fleetflow/providers/service_providers.dart';
import 'package:flutter_fleetflow/widgets/numeric_text_field.dart';
import 'package:flutter_fleetflow/widgets/primary_button.dart';

class MaintenanceReportPage extends ConsumerStatefulWidget {
  const MaintenanceReportPage({super.key});

  @override
  ConsumerState<MaintenanceReportPage> createState() =>
      _MaintenanceReportPageState();
}

class _MaintenanceReportPageState extends ConsumerState<MaintenanceReportPage> {
  final _formKey = GlobalKey<FormState>();
  final _vehicleController = TextEditingController();
  final _costController = TextEditingController();
  final _notesController = TextEditingController();
  MaintenanceServiceType _serviceType = MaintenanceServiceType.engine;
  File? _media;

  @override
  void dispose() {
    _vehicleController.dispose();
    _costController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickMedia() async {
    final selected = await ref
        .read(mediaPickerServiceProvider)
        .pickImageFromGallery();
    setState(() => _media = selected);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    try {
      await ref
          .read(maintenanceProvider.notifier)
          .submit(
            vehicleId: _vehicleController.text.trim(),
            serviceType: _serviceType,
            cost: _costController.text.trim().isEmpty
                ? null
                : double.tryParse(_costController.text.trim()),
            notes: _notesController.text.trim().isEmpty
                ? null
                : _notesController.text.trim(),
            media: _media,
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Maintenance issue reported')),
        );
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
    final loading = ref.watch(maintenanceProvider).isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('Report Maintenance Issue')),
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
                    ? 'Vehicle ID required'
                    : null,
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<MaintenanceServiceType>(
                value: _serviceType,
                decoration: const InputDecoration(labelText: 'Issue Type'),
                items: MaintenanceServiceType.values
                    .map(
                      (type) =>
                          DropdownMenuItem(value: type, child: Text(type.name)),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _serviceType = value);
                  }
                },
              ),
              const SizedBox(height: 10),
              NumericTextField(
                controller: _costController,
                label: 'Cost (optional)',
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _notesController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Notes'),
              ),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: _pickMedia,
                icon: const Icon(Icons.photo_camera_back_outlined),
                label: Text(
                  _media == null ? 'Add Photo/Video' : 'Media selected',
                ),
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'Submit Report',
                icon: Icons.build_circle_outlined,
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
