# Configurações das unidades

Cada arquivo desta pasta representa uma unidade atendida pelo Sistema de Permutas.

A interface e as regras comuns permanecem em `index.html`, `style.css` e `script.js`. Dados próprios de cada GBM, como nome da unidade, brasão e endereço do Apps Script, ficam exclusivamente no respectivo arquivo de configuração.

## Unidade ativa

- `01gbm.js`: configuração do 1º GBM, utilizada atualmente pela página publicada na raiz.

## Inclusão de outra unidade

Para adicionar um novo GBM:

1. crie o arquivo de configuração da unidade, seguindo o modelo de `01gbm.js`;
2. informe a implantação do Apps Script pertencente à conta institucional da unidade;
3. disponibilize a página da unidade em um caminho próprio;
4. teste carregamento dos militares, envio, consulta e cancelamento antes da publicação.

Nunca inclua senhas, tokens, chaves privadas ou dados pessoais nos arquivos desta pasta. O GitHub Pages é público. A autorização das operações deve ser validada pelo backend no Apps Script.
