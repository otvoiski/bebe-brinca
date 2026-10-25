# Bebê Brinca

App de brincadeiras para bebês de ~1 ano, feito para o Galaxy Tab S6 Lite (funciona em qualquer tablet/celular).
Funciona **sem internet** depois de instalado, em tela cheia e deitado (paisagem).

## Brincadeiras

| | Jogo | O que estimula |
|---|---|---|
| 🐮 | **Animais** — toca no bicho: ouve o som real dele (vaca mugindo, cachorro latindo…), aparece um balão "Muuu!" e a voz diz o nome. Se ninguém toca, um bichinho se mexe chamando | vocabulário, sons dos animais |
| 🫧 | **Bolhas** — bolhas sobem devagar; tocar estoura (toque perto também vale) | coordenação olho-mão |
| 🎨 | **Pintar** — pintar com o dedo; as bolinhas de cor falam o nome da cor | cores, coordenação motora |
| 🎹 | **Música** — xilofone colorido; arrastar o dedo toca várias notas | causa e efeito, música |
| 🚗 | **Carrinho** — toca em qualquer lugar e o carrinho vai até lá; chegando na casa, escola, vaca… ele fala onde chegou. Tocar no carrinho buzina e troca de veículo (ônibus, bombeiro, trator, ambulância) | causa e efeito, noção de espaço, vocabulário |
| 🙈 | **Cadê?** — toca na cortina, ela sobe e aparece um bicho ou brinquedo: "Achou o gato!" | permanência do objeto (esconde-esconde) |

Não existe "errar": todo toque dá som, cor e animação.

## Para o adulto

- **Voltar ao menu:** segure a 🏠 (canto de cima) por ~2 segundos. Um toque rápido do bebê não sai do jogo.
- **Prender o bebê no app:** no tablet, ative *Configurações → Segurança e privacidade → Mais config. de segurança → Fixar janelas*. Depois abra o app, toque no botão de apps recentes, no ícone do app e em **Fixar este app**. Para sair: segure Voltar + Recentes.
- **Voz em português:** o app usa a voz do próprio Android. Se não falar, vá em *Configurações → Gerenciamento geral → Saída de conversão de texto em voz*, escolha o mecanismo do Google e instale/baixe o idioma **Português (Brasil)**.
- Volume: a fala e os sons usam o volume de mídia do tablet.

## Instalar no tablet

O app precisa estar num endereço `https://` uma vez para ser instalado (depois funciona offline).

1. No tablet, abra **https://otvoiski.github.io/bebe-brinca/** no **Chrome**.
2. Menu ⋮ → **Instalar app** (ou "Adicionar à tela inicial").
3. Abra pelo ícone "Bebê Brinca" na tela inicial — abre em tela cheia, sem barra do navegador.

## Testar no computador

```bash
python3 -m http.server 8765
```

Depois abra http://localhost:8765.

## Sons

Gravações reais com licença livre do Wikimedia Commons — autores e licenças em [sons/CREDITOS.md](sons/CREDITOS.md).

## Atualizações

Ao abrir o app com internet, ele baixa a versão nova em segundo plano; a mudança aparece na próxima vez que for aberto.
