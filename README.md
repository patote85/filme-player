# Filme

Player de um filme. A música, as fotos e o número ficam de fora deste repositório.

Coloque o áudio em `public/film/trilha.m4a`, as fotos em `public/film/` e o número em `WHATSAPP` dentro de `src/lib/film.ts`.

```sh
npm install
npm run dev
```

## O que é

Um "filme" de uma música só, com cara de app de streaming. Tem tela de perfis, vitrine com capítulos, detalhe, e um player com fotos em sequência e legenda sincronizada. No fim da música aparece um pedido com botões de resposta pelo WhatsApp.

Tudo roda no navegador. O progresso, a lista e a resposta ficam no `localStorage` do aparelho.

## Stack

- TanStack Start + React 19 + Vite 8 (Nitro, preset Vercel)
- Tailwind CSS 4, ícones `lucide-react`
- Testes com `node --test` (precisa de Node 22 ou mais novo, por causa de `--experimental-strip-types` e do glob em `scripts/**`)

## Rodar local

```sh
npm ci
npm run dev          # http://localhost:8080
npm run typecheck
npm test
npm run build
```

## Mídia e dados pessoais (placeholders)

Este repositório não guarda mídia nem dado pessoal de verdade. O que está aqui é placeholder:

| O quê | Onde | Placeholder neste repo |
| --- | --- | --- |
| Música | `public/film/trilha.m4a` (`AUDIO_SRC` em `src/lib/film.ts`) | Áudio silencioso de 168,33 s |
| Fotos | `public/film/cena-1.jpg` … `cena-8.jpg` (mapa `stills` em `src/lib/film.ts`) | Cartões "Cena N · PLACEHOLDER" |
| WhatsApp | `WHATSAPP` em `src/lib/film.ts` | Vazio. Os botões ficam com `href="#"` |
| Nomes | `src/components/who.tsx`, `browse.tsx`, `detail.tsx` | "Você", inicial "V", "Nome Exemplo" |
| Legendas | `lyrics` em `src/lib/film.ts` | "Frase." |

Pra usar com dados reais, troque os arquivos mantendo o nome (ou mude o caminho em `src/lib/film.ts`) e preencha `WHATSAPP` só com dígitos, no formato DDI+DDD+número (ex. fictício `5500000000000`). Não comite mídia nem número real aqui.

Fotos: use JPEG com no máximo 1400 px de largura, qualidade ~80 e sem metadados (EXIF/GPS). Exemplo com Pillow:

```sh
python3 -c "from PIL import Image; im=Image.open('in.jpg').convert('RGB'); im.thumbnail((1400,1400)); im.save('public/film/cena-1.jpg', quality=80, optimize=True, progressive=True)"
```

Se o tempo da música mudar, ajuste `RUNTIME` e `ASK_AT` (segundo em que abre o pedido) em `src/lib/film.ts`. A retomada ("Continuar") vale só antes de `ASK_AT`.

## Publicar

O app publicado é feito e publicado pelo Grok Build, com a mídia e os dados reais. Este repo é uma cópia sanitizada pra código e revisão. Correções entram no app publicado por um pedido ao Grok Build descrevendo o comportamento.

Pra publicar esta cópia em outro lugar, `npm run build` gera `.vercel/output` (Vercel). `npx vite preview` serve o build local.

## Correções aplicadas (QA mobile, out/2026)

1. Depois do fim, a home voltava com "Continuar · 2:38" e abria direto no pedido. Agora `canResume` só aceita posição antes de `ASK_AT` (158 s), e fechar o player depois do fim não grava progresso. Volta a mostrar "Assistir". Teste em `src/lib/film.test.ts`.
2. O `<audio>` usava `preload="auto"` e baixava a música inteira (3,3 MB no app real) já na tela de perfis. Agora é `preload="metadata"`.
3. Alvos de toque de 44 px no botão Perfil (o avatar de 32 px fica dentro de uma área de 44 px) e no "Ouvir de novo".
4. Axe `region`: o detalhe e o player são telas cheias por cima da vitrine, agora com `role="dialog"`, `aria-modal` e `aria-label`. A página continua com um único `<main>`.

## Limitações

- O repo não reproduz o app publicado (outros nomes de arquivo, sem mídia real). Valide no app publicado depois de pedir a correção ao Grok Build.
- Sem o arquivo de áudio, o player mostra "Tocar a música" e não avança.
- O Chromium do Playwright não toca AAC. Teste o player no WebKit ou num navegador de verdade.
- 14 testes de `scripts/` falham porque dependem de `.grok/` e de arquivos do template que não vêm neste repo. `npx eslint src` acusa um bloco vazio em `src/lib/app-data/client.server.ts`. As duas coisas já estavam assim antes das correções.
- Na tela do pedido, o botão de fechar do topo fica coberto pela camada do pedido. No celular só dá pra sair respondendo ou com Esc. Não foi mexido.
