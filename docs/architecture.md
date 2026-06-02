\# Sakina Architecture



\## System Diagram

```mermaid

graph TD

&nbsp;   subgraph Core

&nbsp;       App\["App.tsx — Main Orchestrator"]

&nbsp;       Types\["types.ts — Interfaces \& Enums"]

&nbsp;       Constants\["constants.ts — Static Assets \& Data"]

&nbsp;   end



&nbsp;   subgraph Components

&nbsp;       VP\["VideoPlayer"]

&nbsp;       AP\["AudioPlayer"]

&nbsp;       QO\["QuoteOverlay"]

&nbsp;       IO\["InfoOverlay"]

&nbsp;       LO\["LocationOverlay"]

&nbsp;       SO\["StartOverlay"]

&nbsp;       DB\["Dashboard"]

&nbsp;   end



&nbsp;   subgraph Services

&nbsp;       SS\["streamService"]

&nbsp;       AS\["audioService"]

&nbsp;       CS\["contentService"]

&nbsp;       GS\["geminiService"]

&nbsp;       PS\["pexelsService"]

&nbsp;       PX\["pixabayService"]

&nbsp;       AA\["appleAerialsService"]

&nbsp;   end



&nbsp;   App --> VP \& AP \& QO \& IO \& LO \& SO \& DB

&nbsp;   App --> SS \& AS \& CS

&nbsp;   SS --> PS \& PX \& AA

&nbsp;   CS --> GS

