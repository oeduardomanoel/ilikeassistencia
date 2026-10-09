# iLike Assistência Apple

Site institucional da iLike Assistência Apple (Balneário Camboriú, SC).

Site estático, sem build: `index.html` + `assets/`. GSAP, ScrollTrigger, Lenis e as fontes (Geist, Instrument Serif, JetBrains Mono) estão hospedados localmente em `assets/vendor` e `assets/fonts`, então não depende de CDN.

## Rodar local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicar

Qualquer hospedagem estática serve (GitHub Pages, Vercel, Netlify, Hostinger). Basta subir a pasta inteira.

## Onde editar

- Número do WhatsApp: busque `5547989110775` no `index.html` e no `assets/js/main.js`.
- Textos: todos no `index.html`.
- Cores: variáveis no topo de `assets/css/style.css` (`--accent` é o laranja).
