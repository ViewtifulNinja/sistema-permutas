# BravoNexo — Sistema de Permutas

Interface web compartilhada do módulo de Permutas do BravoNexo.

A implantação atualmente publicada atende ao **1º GBM**, mantendo o endereço já utilizado pela unidade:

- https://bmbrunocosta.github.io/sistema-permutas/

## Arquitetura

O projeto foi preparado para atender vários GBMs sem duplicação do código principal:

```text
GitHub Pages        → interface compartilhada
config/<unidade>.js → identificação e endereço do backend de cada GBM
Google Apps Script  → processamento, validações e API da unidade
Google Sheets       → base de dados administrativa da unidade
```

Cada GBM deve continuar com sua própria conta Google, planilha, Apps Script e implantação. Apenas a interface comum é compartilhada.

## Estrutura

```text
index.html          estrutura da página
style.css           aparência visual compartilhada
script.js           funcionamento e comunicação com o backend
config/01gbm.js     configuração ativa do 1º GBM
brasao.png          brasão usado pela configuração do 1º GBM
manifest.json       instalação como aplicativo/PWA do 1º GBM
```

## Funcionalidades

- solicitação de permuta;
- identificação automática dos militares pelo RG;
- validação do e-mail do responsável;
- registro na planilha da unidade;
- confirmação automática por e-mail;
- aviso de solicitação fora do prazo de 48 horas;
- consulta de permutas futuras;
- histórico dos últimos 40 dias;
- solicitação e confirmação de cancelamento por código;
- bloqueio de cancelamento quando a permuta já foi analisada ou está fora do prazo.

## Configuração atual

- Unidade: 1º GBM
- Configuração: `config/01gbm.js`
- Interface: v3.68
- Backend: implantação 68 do Apps Script

## Segurança

O GitHub Pages publica arquivos estáticos na internet. Não devem ser adicionados ao repositório senhas, tokens, chaves privadas ou dados pessoais. Toda autorização de leitura ou escrita deve ser validada no Apps Script.
