# Sistema de Permutas

Sistema web desenvolvido para auxiliar o controle e a solicitação de permutas de serviço no âmbito do 1º GBM.

## Sobre o projeto

O Sistema de Permutas permite que o militar solicite uma permuta diretamente pelo celular, informando:

* e-mail do responsável pela permuta;
* data do serviço;
* RG do militar que entra;
* RG do militar que sai;
* observações adicionais, quando necessário.

O sistema realiza a identificação automática dos militares pelo RG, registra a solicitação em uma planilha de controle e envia e-mails automáticos de confirmação.

Também permite consultar permutas futuras por RG, informa quando uma solicitação está fora do prazo regulamentar de 48 horas de antecedência e permite solicitar o cancelamento de permutas ainda pendentes de análise, mediante confirmação por código enviado ao e-mail de um dos militares envolvidos.

## Funcionalidades

* interface responsiva para uso em celular;
* consulta automática de militares pelo RG;
* validação do e-mail do responsável pela permuta;
* registro direto em planilha Google Sheets;
* envio automático de e-mails de confirmação de recebimento;
* aviso visual para solicitações fora do prazo de 48 horas;
* aviso no e-mail quando a solicitação estiver fora do prazo;
* envio de resultado de permuta autorizada ou cancelada;
* consulta de permutas futuras por RG;
* consulta do histórico de permutas dos últimos 40 dias por RG;
* solicitação de cancelamento de permutas pendentes;
* confirmação de cancelamento por código enviado ao e-mail;
* bloqueio de cancelamento para permutas já analisadas;
* bloqueio de cancelamento fora do prazo mínimo de 48 horas;
* registro automático do motivo do cancelamento na planilha;
* controle de tentativas e validade do código de cancelamento;
* controle de processamento das solicitações;
* organização e formatação automática da planilha;
* destaque visual na planilha para solicitações fora do prazo.

## Estrutura do projeto

index.html  → estrutura da página
style.css   → aparência visual do sistema
script.js   → funcionamento da interface e comunicação com o Apps Script
brasao.png  → imagem utilizada no cabeçalho

## Tecnologias utilizadas

* HTML
* CSS
* JavaScript
* GitHub Pages
* Google Apps Script
* Google Sheets

## Arquitetura

Este repositório contém a interface web do sistema, hospedada pelo GitHub Pages.

O processamento dos dados, validações, envio de e-mails, controle de cancelamentos e integração com a planilha são realizados por meio de Google Apps Script, utilizado como backend/API do sistema.

GitHub Pages → interface do usuário
Google Apps Script → processamento e API
Google Sheets → base de dados e controle administrativo

## Nomenclatura de versões

A evolução do sistema segue a seguinte organização:

v1 = versão baseada em Google Forms
v2 = versão WebApp direto pelo Google Apps Script
v3 = versão com interface no GitHub Pages e backend em Google Apps Script

## Versão atual

Versão atual: v3.67

A versão v3.67 indica que o sistema utiliza a interface hospedada no GitHub Pages, com backend/API na implantação 67 do Google Apps Script.

## Observação

Este sistema é de uso interno e foi desenvolvido para apoiar a rotina administrativa de controle de permutas no 1º GBM.
