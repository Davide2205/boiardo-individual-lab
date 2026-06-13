# Backend prenotazioni — Google Sheets + Apps Script

Mini-backend che salva le prenotazioni in un tuo Foglio Google (privato) e dice
alla pagina quanti posti restano per ogni slot. Niente server da mantenere, gratis.

## Cosa ti serve
Un account Google (basta quello che usi normalmente).

## Passi (5 minuti, tutto da browser)

1. **Crea il foglio**
   - Vai su https://sheets.google.com → *Foglio vuoto*.
   - Rinominalo es. `Prenotazioni Boiardo Lab`. (La scheda "Prenotazioni" la crea lo script da solo.)

2. **Apri l'editor di script**
   - Nel foglio: menu **Estensioni → Apps Script**.

3. **Incolla il codice**
   - Cancella tutto il contenuto del file `Code.gs` e incolla il contenuto di
     [`Code.gs`](Code.gs) (questo file).
   - (Facoltativo ma consigliato) imposta il fuso orario: in alto a sinistra clic sull'icona
     ⚙️ *Impostazioni progetto* → spunta "Mostra file manifest `appsscript.json`",
     poi apri `appsscript.json` e sostituiscilo col contenuto di
     [`appsscript.json`](appsscript.json). Salva (Ctrl/Cmd+S).

4. **Pubblica come Web App**
   - In alto a destra: **Esegui il deployment → Nuovo deployment**.
   - Icona ⚙️ accanto a "Seleziona tipo" → **App web**.
   - Configura:
     - *Descrizione*: `Prenotazioni`
     - *Esegui come*: **Me (tuo indirizzo)**
     - *Chi ha accesso*: **Chiunque**  ← importante (serve perché la pagina pubblica possa leggere/scrivere)
   - **Esegui il deployment**.
   - La prima volta Google chiede di **autorizzare**: scegli il tuo account →
     "Avanzate" → "Vai a … (non sicuro)" → *Consenti*. (È normale: è la *tua* app sul *tuo* foglio.)

5. **Copia l'URL**
   - Ti dà un **URL Web App** che finisce con `/exec`. Copialo e **mandamelo**:
     lo incollo nella pagina (`CONFIG.endpoint`) e ridistribuisco. Da quel momento
     gli slot mostrano i posti liberi reali e ogni prenotazione finisce nel foglio.

## Test rapido (facoltativo)
Apri nel browser `IL_TUO_URL/exec?action=availability` → deve rispondere con un JSON tipo
`{"ok":true,"capacity":10,"counts":{}}`.

## Note
- **Capienza**: 10 atleti per slot (modificabile: `var CAPACITY = 10;` in `Code.gs`).
- **Slot validi**: martedì e mercoledì, 18:30, prossime 4 settimane (controllo lato server anti-manomissione).
- **Privacy**: i dati (anche dei minori) restano nel **tuo** foglio privato, non nel repo pubblico.
- **Se cambi il codice** dello script: rifai *Esegui il deployment → Gestisci deployment →
  (matita) → Nuova versione*, così l'URL resta lo stesso.
