import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_fleetflow/models/dashboard_data.dart';
import 'package:flutter_fleetflow/models/status_enums.dart';
import 'package:flutter_fleetflow/providers/auth_provider.dart';
import 'package:flutter_fleetflow/providers/dashboard_provider.dart';
import 'package:flutter_fleetflow/providers/realtime_provider.dart';
import 'package:flutter_fleetflow/widgets/status_pill.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(realtimeBindingProvider);
    final roleAsync = ref.watch(currentRoleProvider);
    final role = roleAsync.maybeWhen(data: (value) => value, orElse: () => null);
    final canUseTrips = role == 'manager' || role == 'dispatcher';
    final canUseFuel =
        role == 'manager' || role == 'financial' || role == 'dispatcher';
    final canUseMaintenance = role == 'manager' || role == 'safety_officer';
    final dashboardAsync = ref.watch(dashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Dashboard'),
        actions: [
          IconButton(
            onPressed: () async {
              try {
                await ref.read(authControllerProvider.notifier).signOut();
              } catch (error) {
                if (context.mounted) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text(error.toString())));
                }
              }
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: dashboardAsync.when(
        data: (DashboardData dashboard) {
          final driver = dashboard.driver;
          return RefreshIndicator(
            onRefresh: () => ref.refresh(dashboardProvider.future),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (driver != null) ...[
                  Text(
                    'Welcome, ${driver.name}',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  StatusPill(
                    label: driver.status == DriverStatus.onDuty
                        ? 'On Duty'
                        : 'Off Duty',
                    color: driver.status == DriverStatus.onDuty
                        ? Colors.green
                        : Colors.orange,
                  ),
                  const SizedBox(height: 8),
                ],
                if (dashboard.licenseExpiringSoon)
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.warning_amber_rounded),
                      title: const Text('License expiry warning'),
                      subtitle: const Text(
                        'Your driving license is expiring soon.',
                      ),
                    ),
                  ),
                Card(
                  child: ListTile(
                    title: const Text('Current Assigned Vehicle'),
                    subtitle: Text(
                      dashboard.assignedVehicle == null
                          ? 'No active vehicle'
                          : '${dashboard.assignedVehicle!.model} • ${dashboard.assignedVehicle!.licensePlate}',
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Today\'s Trips',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                if (dashboard.todaysTrips.isEmpty)
                  const Card(
                    child: ListTile(title: Text('No trips assigned today')),
                  )
                else
                  ...dashboard.todaysTrips.map(
                    (trip) => Card(
                      child: ListTile(
                        onTap: () => context.push('/trips/${trip.id}'),
                        title: Text('${trip.origin} → ${trip.destination}'),
                        subtitle: Text('Status: ${trip.status.name}'),
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
                if (canUseTrips) ...[
                  FilledButton.icon(
                    onPressed: () => context.push('/trips'),
                    icon: const Icon(Icons.route),
                    label: const Text('Start Trip'),
                  ),
                  const SizedBox(height: 8),
                ],
                if (canUseFuel) ...[
                  FilledButton.icon(
                    onPressed: () => context.push('/fuel'),
                    icon: const Icon(Icons.local_gas_station),
                    label: const Text('Fuel Log'),
                  ),
                  const SizedBox(height: 8),
                ],
                if (canUseMaintenance)
                  FilledButton.icon(
                    onPressed: () => context.push('/maintenance'),
                    icon: const Icon(Icons.build),
                    label: const Text('Report Issue'),
                  ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(error.toString(), textAlign: TextAlign.center),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () => ref.invalidate(dashboardProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
