# Architectuurbeslissingen

## `defineBlock` als primaire API (v0.2)

**Beslissing:** `defineBlock` vervangt de `registerBlockRenderer` + `cms-config.json` combinatie als de enige manier om een CMS block te definiëren.

**Waarom:** Eén definitiepunt voorkomt drift tussen schema en renderer. Type inference uit de field-definities elimineert blind casten. Minder bestanden per project = minder kans op fouten.

**Hoe:** `defineBlock` registreert zowel de renderer (voor `CmsBlock`/preview) als het schema (voor `npx cms sync`). De `cms-config.json` bevat alleen nog de `pages` array — components komen uit de code.

---

## Multi-tenant CMS, één instantie

**Beslissing:** Eén Miso CMS instantie bedient alle client websites via tenants (API key per tenant).

**Waarom:** Per-project instanties (zoals Sanity of Payload) zijn duurder te beheren, geven geen hergebruik van component definities, en schalen slecht als het aantal clients groeit.

**Gevolg:** Schema sync via de API is de enige manier om schema's bij te werken — de CMS admin kan niet direct uit client code lezen omdat er meerdere clients zijn.

---

## ComponentDefinitions zijn globaal (geen tenant_id)

**Beslissing:** `ComponentDefinition` records hebben geen `tenant_id`. Ze zijn gedeeld over alle tenants.

**Waarom:** Gedeelde component library. `hero_section` hoeft maar één keer gedefinieerd te worden. Clients hergebruiken dezelfde definities en schrijven alleen wat uniek is voor hen.

**Risico:** Als twee clients dezelfde component slug met verschillende fields synchen, wint de laatste sync. Mitigatie: componenten met dezelfde slug moeten compatible blijven, of clients gebruiken unieke slugs voor client-specifieke variants (bijv. `st_profiel_card` in plaats van `profiel_card`).

---

## Firebase voor dynamische data, CMS voor statische content

**Beslissing:** CMS = marketing/branding content (hero's, tekst, over ons). Firebase = alles wat de klant zelf beheert (aanbod, locaties, events, leden).

**Waarom:** CMS is voor content die zelden verandert en door een developer of beheerder wordt ingevuld. Firebase is voor operationele data die regelmatig verandert en door de eindklant wordt beheerd zonder technische kennis.

**Regel:** Nieuwe features gaan altijd naar Firebase, nooit naar CMS.

---

## CLI schema extractie via tsx subprocess

**Beslissing:** `cms sync --blocks` spawnt een tsx subprocess om schemas uit het blocks bestand te lezen. Het schrijft een tijdelijk `.mts` script naar `os.tmpdir()`, voert het uit met de tsx binary uit `node_modules/.bin/tsx`, en leest het resultaat uit een tijdelijk JSON bestand.

**Waarom niet dynamic import in het CLI proces zelf:** Het CLI proces is gecompileerde ESM JavaScript. Dynamisch importeren van een `.tsx` bestand met JSX zou een aparte transpiler setup vereisen in het CLI proces zelf. Een subprocess met tsx is eenvoudiger en geïsoleerder.

**Waarom output file i.p.v. stdout:** Het blocks bestand kan `console.log` statements bevatten die stdout vervuilen. Een apart output bestand is betrouwbaarder dan stdout parsen.

**Vereiste:** `tsx` als devDependency in het client project (`npm install -D tsx`). De CLI zoekt naar `node_modules/.bin/tsx` relatief aan `process.cwd()`.

---

## `registerBlockRenderer` deprecated maar niet verwijderd

**Beslissing:** `registerBlockRenderer` en `unregisterBlockRenderer` zijn gemarkeerd als `@deprecated` maar nog steeds geëxporteerd.

**Waarom:** Bestaande client websites (vrouwenvereniging, andere nog te migreren) gebruiken nog `registerBlockRenderer` direct. Verwijderen zou een breaking change zijn. Ze worden intern door `defineBlock` aangeroepen.

**Wanneer verwijderen:** Fase 2, nadat alle client websites zijn gemigreerd naar `defineBlock`.

---

## Auto-sync in npm scripts

**Beslissing:** `npx cms sync` draait automatisch bij `npm run dev` en `npm run build` — niet als handmatige stap.

**Waarom:** Een handmatige sync-stap wordt vergeten. Component definities en pagina structuur moeten altijd in sync zijn met de code. Door het in de scripts te zetten is het onmogelijk te vergeten.

**Implementatie:**
```json
"scripts": {
  "dev": "cms sync && next dev",
  "build": "cms sync && next build"
}
```

---

## PreviewListener in de SDK

**Beslissing:** `CmsPreviewListener` is een SDK component, niet per-project copy-paste.

**Waarom:** Beide projecten hadden identieke PreviewListener implementaties. Bugfixes en verbeteringen moesten op twee plekken worden doorgevoerd. Door het in de SDK te zetten is er één implementatie voor alle clients.

**Interface:**
```tsx
<CmsPreviewListener
  renderLayout={(children) => (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )}
/>
```
