# 🦕 Dino Night Run

Jogo estilo "Dino do Google Chrome" com tema noturno, feito com Canvas puro, sem dependências externas.

## 📁 Estrutura de Arquivos

```
dino-night/
├── index.html     # HTML principal, HUD e telas de overlay
├── style.css      # Estilos, tema noturno, animações CSS
├── entities.js    # Classes: Dino, Obstacle, Coin, Cloud, Particle
└── game.js        # Engine principal: loop, física, colisão, pontuação
```

## 🎮 Controles

| Ação          | Teclado           | Mobile   |
|---------------|-------------------|----------|
| Iniciar       | `SPACE` ou `↑`    | Toque    |
| Pular         | `SPACE` ou `↑`    | Toque    |
| Duplo pulo    | `SPACE` ou `↑` 2x | Toque 2x |
| Reiniciar     | `SPACE` ou `↑`    | Toque    |

## ⚡ Funcionalidades

- **Cenário noturno** — céu escuro, estrelas, lua e névoa
- **3 tipos de obstáculo** — cacto 🌵, pedra 🪨 e morcego 🦇
- **Moedas coletáveis** — +5 pontos cada ★
- **Duplo pulo** — pule no ar uma vez extra
- **Velocidade crescente** — fica mais rápido com o tempo (1x → 2.8x)
- **Placar HI** — salvo no localStorage
- **Partículas** — explosão ao morrer e ao pegar moedas
- **HUD** — score, hi-score e velocidade em tempo real

## 🚀 Como Jogar

Basta abrir o arquivo `index.html` em qualquer navegador moderno. Não precisa de servidor.

```bash
# Opção 1: abrir direto
open index.html

# Opção 2: servidor local
npx serve .
python3 -m http.server
```

## 🏗️ Arquitetura

### `entities.js`
Contém todas as classes de entidades do jogo:
- **`Dino`** — personagem principal, física de pulo, animação de corrida
- **`Obstacle`** — cacto, pedra ou morcego, com hitbox ajustado
- **`Coin`** — moeda coletável com animação de rotação
- **`Cloud`** — nuvem decorativa com parallax lento
- **`Particle`** — partículas de efeito visual

### `game.js`
Motor principal:
- **`Game`** — máquina de estados (`IDLE → PLAYING → DEAD`)
- Loop via `requestAnimationFrame`
- Detecção de colisão AABB
- Spawn randômico com intervalos configuráveis
- Ramp de velocidade suave via `CFG.SPEED_INCREMENT`

### `style.css`
Tema noturno com CSS Variables, animações puras e layout responsivo.

## 🎨 Paleta

| Token         | Cor       | Uso               |
|---------------|-----------|-------------------|
| `--bg`        | `#0a0e1a` | Fundo principal   |
| `--accent`    | `#7df9a0` | Score, detalhes   |
| `--accent2`   | `#f9e27d` | Hi-score, moedas  |
| `--danger`    | `#ff4d6d` | Game over         |
| `--moon`      | `#ffeaa7` | Lua               |
