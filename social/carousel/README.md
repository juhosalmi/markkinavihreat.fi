# Markkinavihreät-karuselli

Dataohjattu renderöijä Markkinavihreiden somekaruselleille. Yksi `deck.json` sisään,
kaikki julkaisutiedostot ulos. Ilme on 23.11.2026 luontohaitat-postauksen tyyli
(`social/luontohaitat-hinta/`), joka on toistaiseksi vakiotyyli.

```bash
node social/carousel/render.mjs <slug>
```

Tulosteet, kun dioja on N:

| Tiedosto                                   | Koko      | Käyttö                                           |
| ------------------------------------------ | --------- | ------------------------------------------------ |
| `social/<slug>/dia-N.png`                  | 2160×2880 | tarkistus                                        |
| `social/<slug>/karuselli.png`              | rivi      | koko karuselli yhdellä silmäyksellä              |
| `social/<slug>/media.yaml`                 | –         | Bufferin `media:`-listat alt-teksteineen         |
| `public/social/<date>-<slug>-N.jpg`        | 2160×2880 | Buffer: IG, LinkedIn, Threads, Bluesky, Mastodon |
| `public/social/<date>-<slug>-tiktok-N.jpg` | 1080×1440 | TikTok (enintään 2 073 600 px)                   |

`public/social/` näkyy osoitteessa `https://markkinavihreat.fi/social/…`, kun haara on
pushattu (jokainen push deployaa tuotantoon).

Ajo epäonnistuu, jos dian sisältö ei mahdu kehykseen tai alt-teksti on yli 125 merkkiä.
Sama deck tuottaa aina samat kuvat, joten muutokset tehdään `deck.json`iin, ei kuviin.

## deck.json

```json
{
  "date": "2026-11-23",
  "slides": [
    {
      "type": "cover",
      "title": "Iso otsikko, jossa *korostus.*",
      "lines": ["Alarivi", "(Lähde pvm)"],
      "alt": "…"
    },
    {
      "type": "list",
      "theme": "light",
      "title": "Ongelma",
      "intro": "Johdanto:",
      "mark": "x",
      "items": ["…", "…", "…"],
      "kicker": "Tiivistys *korostettuna.*",
      "alt": "…"
    },
    {
      "type": "list",
      "theme": "tint",
      "title": "Ratkaisu?",
      "intro": "Kun …:",
      "mark": "ok",
      "items": ["…", "…", "…"],
      "kicker": "Näin *markkinat* …",
      "alt": "…"
    },
    {
      "type": "cta",
      "text": "Loppuviesti, jossa *korostus.*",
      "url": "markkinavihreat.fi",
      "alt": "…"
    }
  ]
}
```

- `*teksti*` = kirkas vihreä korostus. Yksi korostus per dia.
- `cover`: tumma kansi, yläreunassa MARKKINAVIHREÄT ja maapallologo, alhaalla pyyhkäisynuoli.
- `list`: `theme` `light` (kerma) tai `tint` (vihertävä); `mark` `x` (terrakotta ✕, ongelmat)
  tai `ok` (vihreä ✓, ratkaisut). `kicker` on tumma laatikko alareunassa; yli 60 merkin
  kicker pienenee automaattisesti.
- `cta`: tumma loppudia, linkki ja Vihreät-logo.
- `alt`: pakollinen, enintään 125 merkkiä (Buffer).
- `aspect` (valinnainen, deckin juuressa): oletus `3:4` (1080×1440), korkein muoto, jonka kaikki alustat ottavat ja joka peittää puhelimessa eniten ruutua. `4:5` vain ennen 24.11.2026 julkaistujen deckien uusintaan.
- `eyebrow` (valinnainen, deckin juuressa): yläreunan teksti, oletus `Markkinavihreät`.
