# FlameLog 🔥

Ein schlichtes Trainingstagebuch für Krafttraining – als Web-App, die sich aufs Handy installieren lässt und offline funktioniert.

## Funktionen

- **Wochenplan**: Push FB und Pull FB im Wechsel, 6× pro Woche – die App schlägt das nächste Training vor und zeigt den Wochenfortschritt
- **Routinen** mit Satzvorgaben pro Übung (auch Bereiche wie 2–3 Sätze) und Varianten, zwischen denen man im Training wechseln kann
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
