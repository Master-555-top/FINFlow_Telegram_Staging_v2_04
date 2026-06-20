# Persist Editable Odometer & Fuel Inputs — v1.67

## Purpose

After v1.66, the user could edit odometer and fuel fields, but values would reset after page reload.

v1.67 persists those editable values locally.

## Storage key

```text
finflow.editableFuelInputs.v1_67
```

## Stored fields

```text
previousOdometerKm
currentOdometerKm
fuelPriceRubPerLiter
consumptionLitersPer100Km
updatedAt
schemaVersion
```

## Default values

```text
previousOdometerKm: 280041
currentOdometerKm: 280420
fuelPriceRubPerLiter: 75.51
consumptionLitersPer100Km: 12
```

## Safety

This is browser localStorage only.

No cloud sync yet.
No Supabase write.
No external API call.
