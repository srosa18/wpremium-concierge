# W Premium · Concierge Digital — Wireframe

Protótipo navegável (HTML/CSS/JS) do **Concierge Digital W Premium**, alinhado ao **Sitemap V1 da Fase 03 (Abril/2026)**.

## Sobre

Wireframe de baixa fidelidade com estética greyscale, placeholders editoriais e estrutura editorial completa — pensado para validar arquitetura de informação, fluxos de navegação, copy e CRO antes do design final.

- **Modo:** Wireframe (não é o visual final)
- **Estado:** 45+ páginas navegáveis · trilíngue PT (estrutura para EN/ES)
- **Stack:** HTML estático · CSS3 puro (sem framework) · Vanilla JS
- **Deploy:** GitHub Pages

## Estrutura (Fase 03)

```
L1  Home

L2  Salas
    └─ L3 Aeroporto [IATA] (14 hubs · template)
        └─ L4 Landing da Sala (12 blocos editoriais · produto-âncora)
            URL: /salas/[iata]/[nome-da-sala]

L2  Airport Rooms
    └─ Arrival Services

L2  Serviços
    ├─ W Fast Pass
    ├─ W Meet & Assist
    └─ Arrival Services

L2  Como Acessar
    ├─ Verificador (MODAL global · W Premium Verify)
    └─ Formas de Acesso (cartões · Day Pass · programas)

L2  Editorial
    ├─ Diário (hub)
    └─ Artigo (template long-form)

L2  Sobre
    ├─ História
    └─ Prêmios

L2  B2B
    ├─ Reservas de Grupo
    └─ Parcerias Operadoras

L2  Contato
    ├─ SAC / FAQ
    ├─ Imprensa
    ├─ Formulário
    └─ Trabalhe Conosco

Login · Conta do Hóspede (V1)
    ├─ Dashboard
    ├─ Minhas Reservas
    ├─ Histórico
    ├─ Preferências
    └─ Perfil

Utility Footer
    ├─ Busca · FAQ · Termos · Privacidade (LGPD)
    └─ Cookies · Acessibilidade (WCAG 2.1 AA) · 404

In-Lounge Mobile (QR · sessão herdada)
    └─ Welcome · Cardápio · Serviço · Voo · Avaliação
```

## Por onde começar

Abra `index.html` no navegador — ou use o link do GitHub Pages.

### Fluxos para testar

1. **Discovery → Landing:** Home → busca aeroporto (GRU) → Hub GRU → 5th Avenue (12 blocos)
2. **W Premium Verify:** clique "Verificar Acesso" em qualquer página (modal global)
3. **Conta do Hóspede:** Login → Dashboard → navegação autenticada
4. **In-Lounge:** abra `in-lounge/welcome.html` (mobile, simula QR check-in)
5. **B2B:** B2B → Reservas de Grupo (formulário) ou Parcerias Operadoras

## Princípios editoriais aplicados (Fase 02)

1. Cada sala é produto, não item de menu
2. Cada landing carrega sua cidade junto
3. Menos é mais — o que tem precisa ser impecável
4. A conversão respeita a respiração editorial
5. O produto fala, a marca escuta

## Stack

- **HTML5** semântico
- **CSS3 puro** com design tokens (CSS Variables)
- **Vanilla JS** (sem dependências) — nav/footer/modal injetados globalmente
- **Inter** (Google Fonts)
- **Sem build step** · roda direto no navegador

## Estrutura de arquivos

```
.
├── index.html                  # Home
├── salas.html                  # Hub L2
├── aeroporto-{iata}.html       # Hubs L3 (template para 14)
├── sala-{slug}.html            # Landings de sala (12 blocos)
├── ...                         # 45 páginas total
├── css/wireframe.css           # Design tokens + components
├── js/app.js                   # Nav/footer/modal/interactions
├── assets/placeholder.svg      # Ícone de placeholder
└── in-lounge/                  # 5 telas mobile pós-QR
    ├── welcome.html
    ├── cardapio.html
    ├── servico.html
    ├── voo.html
    └── avaliacao.html
```

## Status

✅ Sitemap V1 (Fase 03 · Abril/2026) — 100% implementado
✅ 12 blocos editoriais aplicados em 2 landings (5th Avenue · Frevo)
✅ Verificador como modal global
✅ Conta do Hóspede completa (V1)
✅ Utility Footer (LGPD · WCAG · Cookies · Termos)

⏳ Refinamento de copy (em curso · documento de tom de voz)
⏳ Tradução EN/ES (estrutura pronta, conteúdo apenas em PT)

---

**W Premium Group · Concierge Digital · Fase 03**
