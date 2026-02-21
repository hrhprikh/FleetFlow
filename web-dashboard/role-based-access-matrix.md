# 🔐 Role-Based Access Matrix — FleetFlow

## 1️⃣ Manager
This is the system owner / fleet head. They need almost full control as they are responsible for assets, people, and money.

### 👁 Can View
- All vehicles (any status)
- All drivers
- All trips (any status)
- All maintenance logs
- All fuel logs
- Full dashboard & analytics
- Cost summaries
- ROI
- Exports

### ✏ Can Create/Edit
- Add/edit/retire vehicles
- Add/edit drivers
- Toggle driver status (On Duty / Suspended)
- Create maintenance logs
- Close maintenance logs
- Add fuel logs
- Create trips (optional, but allowed)
- Cancel trips

### 🔁 Lifecycle Permissions
- Dispatch trip
- Complete trip
- Cancel trip
- Retire vehicle
- Reactivate vehicle

### 🚫 Should NOT Be Blocked From
- Basically nothing operational.

---

## 2️⃣ Dispatcher
This role handles operations — moving cargo. They should NOT control finances or assets permanently. Their job is scheduling, not asset control.

### 👁 Can View
- Vehicles (only operational fields)
- Drivers (only operational fields)
- Trips
- Maintenance status (read-only)
- Dashboard KPIs (operational only)

### ✏ Can Create/Edit
- Create trip (Draft)
- Dispatch trip
- Complete trip
- Cancel trip
- Update trip origin/destination before dispatch

### 🚫 Cannot
- Add or delete vehicles
- Retire vehicles
- Edit vehicle capacity
- Create maintenance logs
- Edit fuel costs
- View acquisition cost
- View ROI analytics
- Change driver license data

---

## 3️⃣ Safety Officer
This role ensures compliance. Focus is drivers + safety. They care about compliance, not operations or money.

### 👁 Can View
- All drivers
- License expiry
- Safety score
- Trip completion rate
- Vehicle assignment history
- Trips (read-only)
- Dashboard safety metrics

### ✏ Can Create/Edit
- Update driver profile
- Update license expiry
- Change driver status (Suspend / On Duty)
- Add safety notes

### 🚫 Cannot
- Create trips
- Dispatch trips
- Add vehicles
- Retire vehicles
- Add fuel logs
- View financial analytics
- Edit maintenance cost

---

## 4️⃣ Finance Analyst
This role handles money. Finance should see money, not change operations.

### 👁 Can View
- Fuel logs
- Maintenance cost logs
- Vehicle acquisition cost
- Trip revenue
- Cost summary per vehicle
- ROI
- Monthly spend charts
- Analytics page
- Export CSV/PDF

### ✏ Can Create/Edit
- Add fuel logs
- Edit fuel entries
- View (but not edit) maintenance logs
- Generate reports

### 🚫 Cannot
- Create trips
- Dispatch trips
- Complete trips
- Add drivers
- Change driver status
- Retire vehicles
- Modify vehicle operational fields
