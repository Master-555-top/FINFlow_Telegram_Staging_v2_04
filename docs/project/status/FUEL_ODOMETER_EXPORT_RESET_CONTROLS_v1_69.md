# Fuel/Odometer Export & Reset Controls — v1.69

## Purpose

After v1.68, FINFlow could save odometer/fuel history locally.

v1.69 adds safe local export and reset controls.

## Export formats

```text
JSON
CSV
```

## Export safety

Export is generated locally in the browser.

No external API call.
No Supabase write.
No network transfer.

User must manually copy/save the export text.

## Reset safety

History reset uses browser confirmation.

Reset clears only local odometer/fuel history:

```text
finflow.fuelOdometerHistory.v1_68
```

It does not clear:
- daily records;
- funds;
- obligations;
- bank review;
- private raw data files.
