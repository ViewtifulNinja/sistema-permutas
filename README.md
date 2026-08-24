# BravoNexo — Permutas

Interface web compartilhada do módulo de Permutas do BravoNexo.

## Endereços

- Entrada do módulo: https://bravonexo.github.io/permutas/
- 1º GBM: https://bravonexo.github.io/permutas/01gbm/

Durante a migração, o endereço anterior permanece como compatibilidade:

- https://bmbrunocosta.github.io/sistema-permutas/

## Estrutura multiunidade

```text
index.html          entrada do módulo e redirecionamento inicial
shared/             código e estilos compartilhados
01gbm/              página, configuração e manifesto do 1º GBM
18gbm/              futura configuração do 18º GBM
```

A interface e as regras comuns ficam em `shared/`. Cada unidade recebe uma pasta própria com sua identificação e o endereço do respectivo Apps Script.

## Arquitetura

```text
GitHub Pages        → interface compartilhada
<unidade>/config.js → identificação e backend do GBM
Google Apps Script  → processamento, validações e API da unidade
Google Sheets       → base administrativa da unidade
```

Cada GBM deve utilizar sua própria conta Google, planilha, Apps Script e implantação.

## Unidade disponível

### 1º GBM

- Caminho: `01gbm/`
- Interface: v3.68
- Backend: implantação 68 do Apps Script

## Segurança

O GitHub Pages é público. Não devem ser adicionados ao repositório senhas, tokens, chaves privadas ou dados pessoais. A autorização das operações deve ser validada no backend do Apps Script.
