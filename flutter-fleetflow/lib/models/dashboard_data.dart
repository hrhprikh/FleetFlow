import 'package:flutter_fleetflow/models/driver.dart';
import 'package:flutter_fleetflow/models/trip.dart';
import 'package:flutter_fleetflow/models/vehicle.dart';

class DashboardData {
  const DashboardData({
    this.driver,
    this.assignedVehicle,
    this.todaysTrips = const <Trip>[],
    this.licenseExpiringSoon = false,
  });

  final Driver? driver;
  final Vehicle? assignedVehicle;
  final List<Trip> todaysTrips;
  final bool licenseExpiringSoon;
}
