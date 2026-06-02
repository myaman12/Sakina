\# Hook: Constants Protection



\*\*Trigger:\*\* Any request that involves updating assets, datasets, or global static variables.



\*\*Required Action:\*\*

1\. The `constants.ts` file contains critical hardcoded assets (stream providers, static video assets, ~20 audio assets) and trilingual (EN/NL/TR) quote datasets.

2\. \*\*DO NOT\*\* modify, delete, or overwrite `constants.ts` unless the user explicitly commands: "Update the constants file".

3\. If a new feature requires new static data, suggest adding it to `constants.ts` and ask the user for explicit permission before editing the file.

