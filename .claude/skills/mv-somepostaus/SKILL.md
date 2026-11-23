---
name: mv-somepostaus
description: >
  Markkinavihreiden yhteinen somepostaus alusta loppuun: uutisen arvio linjaa vasten,
  kuvateksti, 4 dian karuselli vakioilmeellä (social/carousel/render.mjs), julkaisu Laurin
  tileiltä lavanti-2027:n Buffer-työkaluilla, Facebook-teksti ja kuvat käsin julkaistavaksi
  sekä arkistointi. Käytä, kun käyttäjä kysyy "tehdäänkö tästä markkinavihreä-postaus",
  antaa uutislinkin Markkinavihreille, pyytää MV-karusellia tai haluaa MV-postauksen ulos.
argument-hint: <uutislinkki tai aihe>
---

# /mv-somepostaus

Yksi postaus per ajo. Vaiheet 1–4 tehdään tässä repossa, 5–7 lavanti-2027:n skripteillä
(polku `/home/lapanti/code/lavanti-2027`). Käyttäjä hyväksyy tekstin ja kuvat ennen
julkaisua; julkaisu on ulospäin näkyvä teko, joten aloita se vasta käyttäjän selvän luvan jälkeen.

## 1. Sopiiko aihe linjaan

- Lue lähde (`web-fetch`-agentti, raportti alle 300 sanaa: otsikko, pvm, luvut, kuka sanoo mitä, kuka tilasi).
- Vertaa: `src/content/manifesto/manifesto.fi.md` ja `src/content/programs/*.fi.md` (grep avainsanoilla).
  Nimeä tiedosto:rivi, johon postaus nojaa.
- Suosittele kyllä/ei ja kulma, joka erottaa markkinavihreät muista (esim. hinnat kuntoon, ei syyllistämistä).
- Faktasäännöt: ei tarkkoja prosentteja, jos kysymyksen muotoilua ei tunneta ("yli puolet");
  kerro kyselyn tilaaja rehellisesti (tutkimusyhtiö tekijänä, tilaaja mainittuna); älä keksi
  linjaa, jota ohjelmassa ei ole (kysy tai jätä pois); julkaisupäivä ≠ kyselyn tekoaika.

## 2. Kuvateksti

Markkinavihreiden yhteinen ääni ("me markkinavihreät"). Kieli: ei ajatusviivoja (– —);
"ei X vaan Y" ilman pilkkua ennen _vaan_, kun se yhdistää lauseenosia. Rakenne, joka toimi:
koukku (luku + lähde) → miksi nyt → ongelma → "Entä jos…" → poliittiset keinot → "Vika ei ole
kuluttajassa vaan…" → kysymys kommentteihin → `markkinavihreat.fi` → `#markkinavihreät #vihreät`.
Linkki aina pelkkä `markkinavihreat.fi` (ilman ääkkösiä). Käyttäjä viimeistelee tekstin usein itse:
käytä hänen versiotaan sanatarkasti ja korjaa vain kielivirheet, kerro mitä korjasit.

## 3. Karuselli

1. Luo `social/<slug>/deck.json` (muoto: `social/carousel/README.md`). Vakiokaari:
   `cover` (koukku) → `list` light + `x` (ongelma, kicker "Vika ei ole…") → `list` tint + `ok`
   (ratkaisu, kicker "Näin _markkinat_…") → `cta` (loppuviesti + markkinavihreat.fi).
   Kanteen ei yläotsikkoa aiheesta, ei "lähde"-riviä eikä url:ia: vain otsikko, 1–2 alariviä
   ja tarvittaessa `(Lähde pvm)`. Ei ikoneita sisältödioissa.
2. `node social/carousel/render.mjs <slug>` – korjaa FAIL-rivit (ylivuoto, alt > 125).
3. Näytä: `SendUserFile` `social/<slug>/karuselli.png` (render). Korjaukset → muokkaa deck.json → aja uudelleen.
   Älä muokkaa CSS:ää yksittäisen postauksen takia; jos ilme tarvitsee muutoksen, muuta
   renderöijää ja varmista, että `luontohaitat-hinta` renderöityy yhä pikselilleen samaksi (`cmp`).

## 4. Kuvat verkkoon

Ominaisuushaaralla: commit `social/<slug>/` + `public/social/<date>-<slug>-*.jpg`, push.
Push deployaa tuotantoon (myös PR-haara), ja kuvat näkyvät `https://markkinavihreat.fi/social/…`.
Odota taustalla: `until [ "$(curl -s -o /dev/null -w '%{http_code}' <url>)" = 200 ]; do sleep 10; done`.

## 5. Julkaisu Bufferilla (lavanti-2027)

Kysy ennen tätä: julkaisuaika (yleensä "heti"), kanavat ja Instagramin kanssatekijät.
Oletus: kaikki Laurin kanavat paitsi Facebook, sama teksti kaikkialla.

1. `node scripts/posts-cli.mjs scaffold <date>-<slug> --platforms linkedin,instagram,tiktok,mastodon,threads,bluesky --no-stories --type carousel`
   (ajetaan lavanti-2027:ssa; tiedostot `docs/drafts/social-media/`).
2. Täytä `<date>-<slug>-posts.yaml` (mallina `docs/published/social-media/2026-11-23-luontohaitat-hinta-posts.yaml`):
   - `meta`: `themes` (1–3 slugia `analytics/taxonomy/themes.yaml`:sta), `draftContext: opportunistic|planned|interactive`, `source`.
   - `media:` liitä `social/<slug>/media.yaml`:sta; TikTok käyttää `tiktok:`-listaa. LinkedInissä `media`, ei `document`.
   - Ketjualustat: **älä lyhennä, pilko** kappalerajoista. Bluesky ≤ 300 merkkiä/viesti, Mastodon ja Threads ≤ 500.
     Hashtagit ensimmäiseen viestiin (Mastodon, Bluesky); Mastodonissa numerointi `n/N`.
     Threads: ei hashtageja, `topic: "Markkinavihreät"`.
   - Instagram: jokainen kanssatekijä `userTags`-tägiksi ensimmäiseen kuvaan (ally-avain,
     x 0.2–0.8, y ~0.85–0.9) ja `handSteps.collaborators`. Handlet: `.agents/specs/allies.yaml`.
     Aseta IG ~15 min muita myöhemmäksi, jotta Lauri ehtii lisätä kanssatekijät Bufferissa.
   - Luo myös `<date>-<slug>-session.md` (validointi vaatii sen).
3. `node scripts/buffer-post.mjs create <date>-<slug> --dry-run --quota --no-remote-check` → korjaa FAILit.
4. Aseta `scheduled` muutaman minuutin päähän ja aja ilman `--dry-run`. Jos yksi alusta kaatuu,
   loput: `--platform <p>` kukin erikseen.
5. Kerro käyttäjälle heti: IG:n kanssatekijät lisättävä Bufferissa ennen julkaisua.

**Facebook käsin:** anna koko kuvateksti koodilohkona ja lähetä `public/social/<date>-<slug>-N.jpg`
-kuvat `SendUserFile` (`display: attach`), jotta ne voi tallentaa puhelimeen.

## 6. Tarkistus

Julkaisuajan jälkeen: `node scripts/buffer-post.mjs get <id…> --json` → jokainen `status: "sent"`.

## 7. Arkistointi ja PR

- lavanti-2027: oma worktree `origin/main`:sta, siirrä drafts-tiedostot sinne, `ln -s <repo>/.env .env`,
  `git add` draftit, `node scripts/content-archive.mjs social <date>-<slug> --now <ISO>`.
  TikTokin kuvat Buffer siirtää omaan säilöönsä julkaisun jälkeen → `live-asset-url-mismatch`;
  jos se on ainoa drift, aja `--no-verify` ja kirjaa syy session.md:hen. Commit
  `chore(social): archive <date>-<slug> session`, push, `node scripts/content-push.mjs`.
  Kopioi arkistoidut tiedostot `obsidian-notes/raw/published/social-media/`:iin. Poista worktree.
- markkinavihreat.fi: avaa PR haarasta (kuvat pysyvät sivustolla vasta, kun ne ovat mainissa).

## Opitut sudenkuopat

- TikTok hylkää yli 2 073 600 px kuvat → siksi `-tiktok-N.jpg` 1080×1350.
- Buffer: alt-teksti ≤ 125 merkkiä; `session.md` pakollinen; `themes` pakollinen.
- Remote Control -istunnosta ei voi käynnistää uutta sessiota toiseen repoon: aja lavanti-2027:n
  skriptit suoraan tästä istunnosta absoluuttisilla poluilla.
