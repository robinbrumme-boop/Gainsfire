# FlameLog 🔥

Ein schlichtes Trainingstagebuch für Krafttraining – als Web-App, die sich aufs Handy installieren lässt und offline funktioniert.

## Funktionen

- **Routinen** anlegen (Push / Pull / Beine sind vorbereitet) und mit einem Tipp starten
- **Workout loggen**: Gewicht × Wiederholungen pro Satz, abhaken mit ✓ – die Werte vom letzten Mal sind schon eingetragen
- **Pausentimer** startet automatisch nach jedem Satz (einstellbar, +15 s, überspringen)
- **Zusammenfassung** nach dem Training: Volumen im Vergleich zum letzten Mal, neue Bestleistungen
- **Verlauf** aller Workouts mit Details
- **Statistik**: Verlauf pro Übung (geschätztes 1RM, Max-Gewicht, Volumen), Wochenvergleich, Bestleistungen
- **Übungskatalog** mit 87 Übungen; eigene Übungen lassen sich im Tab „Übungen“ oder direkt beim Hinzufügen im Workout anlegen
- **Backup** als JSON exportieren / importieren – alle Daten bleiben auf dem Gerät

## Aufs Handy

App-Link öffnen, dann
- **iPhone (Safari):** Teilen → „Zum Home-Bildschirm“
- **Android (Chrome):** ⋮ → „App installieren“

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:5173/Gainsfire/
npm run build    # Typecheck + Produktions-Build nach dist/
```

Deployment: Jeder Push auf `main` baut und veröffentlicht die App über GitHub Pages
(`.github/workflows/deploy.yml`).
