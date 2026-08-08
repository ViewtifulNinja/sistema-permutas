const URL_API = "https://script.google.com/macros/s/AKfycbxknTIwCNprGaNG0v6hXGsliYGjvjC3lnm2QJz2F3cELkXHl3Z2xkqVgRcfJofCOS8Otg/exec";

const rgEntra = document.getElementById("rgEntra");
const rgSai = document.getElementById("rgSai");
const idEntra = document.getElementById("idEntra");
const idSai = document.getElementById("idSai");
const form = document.getElementById("formPermuta");
const btnEnviar = document.getElementById("btnEnviar");
const mensagem = document.getElementById("mensagem");
const dataServico = document.getElementById("dataServico");
const avisoPrazoPermuta = document.getElementById("avisoPrazoPermuta");

const btnAbrirConsulta = document.getElementById("btnAbrirConsulta");
const areaConsulta = document.getElementById("areaConsulta");
const rgConsulta = document.getElementById("rgConsulta");
const btnConsultar = document.getElementById("btnConsultar");
const resultadoConsulta = document.getElementById("resultadoConsulta");

const btnAbrirHistorico = document.getElementById("btnAbrirHistorico");
const areaHistorico = document.getElementById("areaHistorico");
const rgHistorico = document.getElementById("rgHistorico");
const btnConsultarHistorico = document.getElementById("btnConsultarHistorico");
const resultadoHistorico = document.getElementById("resultadoHistorico");

let militaresPorRG = {};
let timerConsultaEntra = null;
let timerConsultaSai = null;
let ultimoRgConsultado = "";

carregarMilitares();

async function chamarApi(acao, dados = {}) {
  const resposta = await fetch(URL_API, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      acao: acao,
      dados: dados
    })
  });

  if (!resposta.ok) {
    throw new Error("Falha de comunicaÃ§Ã£o com o servidor.");
  }

  const resultado = await resposta.json();

  if (resultado.sucesso === false || resultado.ok === false) {
    throw new Error(resultado.mensagem || resultado.erro || "Erro ao executar a aÃ§Ã£o.");
  }

  return resultado;
}

async function carregarMilitares() {
  try {
    const resultado = await chamarApi("carregarMilitares");
    const militares = resultado.militares || resultado.resposta || [];

    militaresPorRG = {};

    militares.forEach((militar) => {
      const rg = limparRG(militar.rg || militar.RG || militar.registroGeral);

      if (rg) {
        militaresPorRG[rg] = militar;
      }
    });

    console.log("Militares carregados:", Object.keys(militaresPorRG).length);

  } catch (erro) {
    militaresPorRG = {};
    console.log("Erro ao carregar militares:", erro.message);

    mensagem.textContent =
      "Erro ao carregar a base de militares. Verifique a conexÃ£o ou o link da API.";
    mensagem.className = "mensagem erro";
  }
}

rgEntra.addEventListener("input", () => {
  tratarDigitacaoRG(rgEntra, idEntra, "entra");
});

rgSai.addEventListener("input", () => {
  tratarDigitacaoRG(rgSai, idSai, "sai");
});

rgEntra.addEventListener("blur", () => {
  mostrarIdentificacaoLocal(rgEntra, idEntra);
});

rgSai.addEventListener("blur", () => {
  mostrarIdentificacaoLocal(rgSai, idSai);
});

dataServico.addEventListener("change", () => {
  verificarPrazoPermuta();
});

dataServico.addEventListener("input", () => {
  verificarPrazoPermuta();
});

btnAbrirConsulta.addEventListener("click", () => {
  areaConsulta.classList.toggle("ativa");

  if (areaConsulta.classList.contains("ativa")) {
    rgConsulta.focus();
  }
});

rgConsulta.addEventListener("input", () => {
  rgConsulta.value = limparRG(rgConsulta.value);
});

btnConsultar.addEventListener("click", () => {
  consultarPermutasFuturas();
});

btnAbrirHistorico.addEventListener("click", () => {
  areaHistorico.classList.toggle("ativa");

  if (areaHistorico.classList.contains("ativa")) {
    rgHistorico.focus();
  }
});

rgHistorico.addEventListener("input", () => {
  rgHistorico.value = limparRG(rgHistorico.value);
});

btnConsultarHistorico.addEventListener("click", () => {
  consultarHistoricoPermutas();
});

resultadoConsulta.addEventListener("input", (e) => {
  if (e.target.classList.contains("codigo-cancelamento")) {
    e.target.value = String(e.target.value || "").replace(/\D/g, "").slice(0, 6);
  }
});

resultadoConsulta.addEventListener("click", (e) => {
  const botaoCancelar = e.target.closest(".botao-cancelar");
  const botaoEnviarCodigo = e.target.closest(".botao-enviar-codigo");
  const botaoConfirmarCancelamento = e.target.closest(".botao-confirmar-cancelamento");

  if (botaoCancelar) {
    const chave = botaoCancelar.dataset.chave;
    const area = document.getElementById("cancelamento-" + chave);

    if (area) {
      area.classList.toggle("ativa");
    }

    return;
  }

  if (botaoEnviarCodigo) {
    solicitarCodigoCancelamento({
      chave: botaoEnviarCodigo.dataset.chave,
      linha: botaoEnviarCodigo.dataset.linha,
      idPermuta: botaoEnviarCodigo.dataset.idPermuta,
      rgConsulta: botaoEnviarCodigo.dataset.rgConsulta
    });
    return;
  }

  if (botaoConfirmarCancelamento) {
    confirmarCancelamento({
      chave: botaoConfirmarCancelamento.dataset.chave,
      linha: botaoConfirmarCancelamento.dataset.linha,
      idPermuta: botaoConfirmarCancelamento.dataset.idPermuta,
      rgConsulta: botaoConfirmarCancelamento.dataset.rgConsulta
    });
    return;
  }
});

function limparRG(valor) {
  return String(valor || "").replace(/\D/g, "").slice(0, 7);
}

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

function separarEmailsSite(valor) {
  return String(valor || "")
    .split(/[;,\n]/)
    .map(normalizarEmail)
    .filter(email => email);
}

function obterEmailsMilitar(militar) {
  if (!militar) return [];

  const bruto =
    militar.email ||
    militar.eMail ||
    militar.Email ||
    militar.EMAIL ||
    militar.emailCadastrado ||
    militar.emailCadastro ||
    "";

  return separarEmailsSite(bruto);
}

function tratarDigitacaoRG(input, elementoResultado, tipo) {
  input.value = limparRG(input.value);

  elementoResultado.textContent = "";
  elementoResultado.classList.remove("erro-identificacao");

  if (tipo === "entra") {
    clearTimeout(timerConsultaEntra);

    timerConsultaEntra = setTimeout(() => {
      mostrarIdentificacaoLocal(input, elementoResultado);
    }, 600);
  }

  if (tipo === "sai") {
    clearTimeout(timerConsultaSai);

    timerConsultaSai = setTimeout(() => {
      mostrarIdentificacaoLocal(input, elementoResultado);
    }, 600);
  }
}

function mostrarIdentificacaoLocal(input, elementoResultado) {
  const rg = limparRG(input.value);

  elementoResultado.textContent = "";
  elementoResultado.classList.remove("erro-identificacao");

  if (rg.length < 4) return;

  const militar = militaresPorRG[rg];

  if (militar) {
    elementoResultado.textContent = militar.identificacao || montarIdentificacaoMilitar(militar);
    elementoResultado.classList.remove("erro-identificacao");
  }
}

function montarIdentificacaoMilitar(militar) {
  const partes = [];

  if (militar.postoGrad) partes.push(militar.postoGrad);
  if (militar.posto) partes.push(militar.posto);
  if (militar.nomeGuerra) partes.push(militar.nomeGuerra);
  if (militar.qbmp) partes.push(militar.qbmp);
  if (militar.rg) partes.push("RG " + militar.rg);

  return partes.join(" ");
}

function verificarPrazoPermuta() {
  const valorData = dataServico.value;

  avisoPrazoPermuta.textContent = "";
  avisoPrazoPermuta.classList.remove("ativo");

  if (!valorData) return;

  const partes = valorData.split("-");

  if (partes.length !== 3) return;

  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);

  const dataSelecionada = new Date(ano, mes - 1, dia, 0, 0, 0);

  const limiteMinimo = new Date();
  limiteMinimo.setHours(limiteMinimo.getHours() + 48);

 #oxòÚ$z{-®éÜj×¥Ù½	±½ÅÕ•¥½…¹•±…µ•¹Ñ¼ñð4(€€€Á•ÉµÕÑ„¹µ½Ñ¥Ù½	±½ÅÕ•¥¼ñð4(€€€€‰¹ÑÉ”•´½¹Ñ…Ñ¼½´„…‘µ¥¹¥ÍÑÉ‡Ÿ¼¸ˆ4(€€¤¹ÑÉ¥´ ¤ì4(4(€É•ÑÕÉ¸€4(€€€€ñ‘¥Ø±…ÍÌô‰…Ù¥Í¼µ…¹•±…µ•¹Ñ¼µ¥¹‘¥ÍÁ½¹¥Ù•°ˆø4(€€€€€…¹•±…µ•¹Ñ¼¥¹‘¥ÍÁ½»µÙ•°è€‘í•Í…Á…É!Ñµ°¡µ½Ñ¥Ù¼¥ô4(€€€€ð½‘¥Øø4(€€ì4)ô4(4)™Õ¹Ñ¥½¸½‰Ñ•É±…ÍÍ•MÑ…ÑÕÌ¡ÍÑ…ÑÕÌ¤ì4(€½¹ÍÐÑ•áÑ¼€ôMÑÉ¥¹œ¡ÍÑ…ÑÕÌñð€ˆˆ¤¹ÑÉ¥´ ¤¹Ñ½UÁÁ•É…Í” ¤ì4(4(€¥˜€¡Ñ•áÑ¼€ôôô€‰UQ=I%iˆñðÑ•áÑ¼€ôôô€‰%Q<ˆ¤É•ÑÕÉ¸€‰ÍÑ…ÑÕÌµ™•¥Ñ¼ˆì4(€¥˜€¡Ñ•áÑ¼€ôôô€‰91ˆ¤É•ÑÕÉ¸€‰ÍÑ…ÑÕÌµ…¹•±…‘„ˆì4(4(€É•ÑÕÉ¸€‰ÍÑ…ÑÕÌµÁ•¹‘•¹Ñ”ˆì4)ô4(4)™Õ¹Ñ¥½¸•Í…Á…É!Ñµ°¡Ù…±½È¤ì4(€É•ÑÕÉ¸MÑÉ¥¹œ¡Ù…±½Èñð€ˆˆ¤4(€€€€¹É•Á±…” ¼˜½œ°€ˆ™…µÀìˆ¤4(€€€€¹É•Á±…” ¼ð½œ°€ˆ™±Ðìˆ¤4(€€€€¹É•Á±…” ¼ø½œ°€ˆ™Ðìˆ¤4(€€€€¹É•Á±…” ¼ˆ½œ°€ˆ™ÅÕ½Ðìˆ¤4(€€€€¹É•Á±…” ¼œ½œ°€ˆ˜ŒÀÌäìˆ¤ì4)ô4(4)™Õ¹Ñ¥½¸™½Éµ…Ñ…É…Ñ…	É…Í¥±•¥É„¡‘…Ñ…%Í¼¤ì4(€½¹ÍÐÁ…ÉÑ•Ì€ôMÑÉ¥¹œ¡‘…Ñ…%Í¼ñð€ˆˆ¤¹ÍÁ±¥Ð ˆ´ˆ¤ì4(4(€¥˜€¡Á…ÉÑ•Ì¹±•¹Ñ €„ôô€Ì¤É•ÑÕÉ¸•Í…Á…É!Ñµ°¡‘…Ñ…%Í¼¤ì4(4(€É•ÑÕÉ¸Á…ÉÑ•ÍlÉt€¬€ˆ¼ˆ€¬Á…ÉÑ•ÍlÅt€¬€ˆ¼ˆ€¬Á…ÉÑ•ÍlÁtì4)ô4(4)™Õ¹Ñ¥½¸Ñ•¹Ñ…ÉAÉ½•ÍÍ…ÉA•ÉµÕÑ„¡±¥¹¡„°Ñ•¹Ñ…Ñ¥Ù„¤ì4(€½¹ÍÐ…ÑÉ…Í¼€ôÑ•¹Ñ…Ñ¥Ù„€ôôô€Ä€ü€ÄÔÀÀ€è€ØÀÀÀì4(4(€Í•ÑQ¥µ•½ÕÐ  ¤€ôøì4(€€€¡…µ…ÉÁ¤ ‰ÁÉ½•ÍÍ…ÉA•ÉµÕÑ…A•¹‘•¹Ñ”ˆ°ì4(€€€€€±¥¹¡„è±¥¹¡„4(€€€ô¤4(€€€€€€¹Ñ¡•¸ ¡É•ÍÕ±Ñ…‘½AÉ½•ÍÍ…µ•¹Ñ¼¤€ôøì4(€€€€€€€½¹Í½±”¹±½œ ‰I•Ñ½É¹¼‘¼ÁÉ½•ÍÍ…µ•¹Ñ¼½µÁ±•µ•¹Ñ…Èèˆ°É•ÍÕ±Ñ…‘½AÉ½•ÍÍ…µ•¹Ñ¼¤ì4(4(€€€€€€€½¹ÍÐÉ•ÍÁ½ÍÑ…AÉ½•ÍÍ…µ•¹Ñ¼€ôÉ•ÍÕ±Ñ…‘½AÉ½•ÍÍ…µ•¹Ñ¼¹É•ÍÁ½ÍÑ„ñðíôì4(4(€€€€€€€¥˜€¡É•ÍÁ½ÍÑ…AÉ½•ÍÍ…µ•¹Ñ¼¹Á•¹‘•¹Ñ”€˜˜Ñ•¹Ñ…Ñ¥Ù„€ð€È¤ì4(€€€€€€€€€½¹Í½±”¹±½œ ‰AÉ½•ÍÍ…µ•¹Ñ¼½ÕÁ…‘¼¸Q•¹Ñ…¹‘¼¹½Ù…µ•¹Ñ”¸¸¸ˆ¤ì4(€€€€€€€€€Ñ•¹Ñ…ÉAÉ½•ÍÍ…ÉA•ÉµÕÑ„¡±¥¹¡„°Ñ•¹Ñ…Ñ¥Ù„€¬€Ä¤ì4(€€€€€€€ô4(€€€€€ô¤4(€€€€€€¹…Ñ  ¡•ÉÉ¼¤€ôøì4(€€€€€€€½¹Í½±”¹±½œ ‰ÉÉ¼¹¼ÁÉ½•ÍÍ…µ•¹Ñ¼½µÁ±•µ•¹Ñ…Èèˆ°•ÉÉ¼¹µ•ÍÍ…”¤ì4(4(€€€€€€€¥˜€¡Ñ•¹Ñ…Ñ¥Ù„€ð€È¤ì4(€€€€€€€€€Ñ•¹Ñ…ÉAÉ½•ÍÍ…ÉA•ÉµÕÑ„¡±¥¹¡„°Ñ•¹Ñ…Ñ¥Ù„€¬€Ä¤ì4(€€€€€€€ô4(€€€€€ô¤ì4(€ô°…ÑÉ…Í¼¤ì4)ô4(4)™Õ¹Ñ¥½¸Ù…±¥‘…Éµ…¥±…¹•±…µ•¹Ñ¼¡É½¹ÍÕ±Ñ…‘¼°•µ…¥°¤ì4(€½¹ÍÐ•µ…¥±9½Éµ…±¥é…‘¼€ô¹½Éµ…±¥é…Éµ…¥°¡•µ…¥°¤ì4(4(€¥˜€ …•µ…¥±9½Éµ…±¥é…‘¼¤ì4(€€€É•ÑÕÉ¸€‰%¹™½Éµ”¼”µµ…¥°…‘…ÍÑÉ…‘¼Á…É„¼I½¹ÍÕ±Ñ…‘¼¸ˆì4(€ô4(4(€½¹ÍÐµ¥±¥Ñ…É½¹ÍÕ±Ñ…‘¼€ôµ¥±¥Ñ…É•ÍA½ÉImÉ½¹ÍÕ±Ñ…‘½tì4(€½¹ÍÐ•µ…¥±Í…‘…ÍÑÉ…‘½Ì€ô½‰Ñ•Éµ…¥±Í5¥±¥Ñ…È¡µ¥±¥Ñ…É½¹ÍÕ±Ñ…‘¼¤ì4(4(€¥˜€¡•µ…¥±Í…‘…ÍÑÉ…‘½Ì¹±•¹Ñ €ø€À€˜˜€…•µ…¥±Í…‘…ÍÑÉ…‘½Ì¹¥¹±Õ‘•Ì¡•µ…¥±9½Éµ…±¥é…‘¼¤¤ì4(€€€É•ÑÕÉ¸€‰<”µµ…¥°¥¹™½Éµ…‘¼»¼Á•ÉÑ•¹”…¼I½¹ÍÕ±Ñ…‘¼¸%¹™½Éµ”¼”µµ…¥°…‘…ÍÑÉ…‘¼Á…É„•ÍÍ”µ¥±¥Ñ…È¸ˆì4(€ô4(4(€É•ÑÕÉ¸€ˆˆì4)ô4(4)™Õ¹Ñ¥½¸µ½¹Ñ…ÉA…å±½…‘…¹•±…µ•¹Ñ¼¡Á…É…µÌ°‘…‘½ÍáÑÉ…Ì€ôíô¤ì4(€½¹ÍÐ±¥¹¡„€ôMÑÉ¥¹œ¡Á…É…µÌ¹±¥¹¡„ñð€ˆˆ¤¹ÑÉ¥´ ¤ì4(€½¹ÍÐ¥‘A•ÉµÕÑ„€ôMÑÉ¥¹œ¡Á…É…µÌ¹¥‘A•ÉµÕÑ„ñð±¥¹¡„ñð€ˆˆ¤¹ÑÉ¥´ ¤ì4(€½¹ÍÐÉ½¹ÍÕ±Ñ…‘¼€ô±¥µÁ…ÉI¡Á…É…µÌ¹É½¹ÍÕ±Ñ„ñðÕ±Ñ¥µ½I½¹ÍÕ±Ñ…‘¼ñðÉ½¹ÍÕ±Ñ„¹Ù…±Õ”¤ì4(4(€É•ÑÕÉ¸ì4(€€€±¥¹¡„è±¥¹¡„°4(€€€É½Üè±¥¹¡„°4(€€€¥‘A•ÉµÕÑ„è¥‘A•ÉµÕÑ„°4(€€€¥è¥‘A•ÉµÕÑ„°4(€€€É½¹ÍÕ±Ñ„èÉ½¹ÍÕ±Ñ…‘¼°4(€€€ÉœèÉ½¹ÍÕ±Ñ…‘¼°4(€€€€¸¸¹‘…‘½ÍáÑÉ…Ì4(€ôì4)ô4(4)…Íå¹Œ™Õ¹Ñ¥½¸Í½±¥¥Ñ…É½‘¥½…¹•±…µ•¹Ñ¼¡Á…É…µÌ°É½¹ÍÕ±Ñ……¹•±…µ•¹Ñ¼¤ì4(€¥˜€ …Á…É…µÌñðÑåÁ•½˜Á…É…µÌ€„ôô€‰½‰©•Ðˆ¤ì4(€€€Á…É…µÌ€ôì4(€€€€€¡…Ù”èÁ…É…µÌ°4(€€€€€±¥¹¡„èÁ…É…µÌ°4(€€€€€¥‘A•ÉµÕÑ„èÁ…É…µÌ°4(€€€€€É½¹ÍÕ±Ñ„èÉ½¹ÍÕ±Ñ……¹•±…µ•¹Ñ¼4(€€€ôì4(€ô4(4(€½¹ÍÐ…É•„€ô‘½Õµ•¹Ð¹•Ñ±•µ•¹Ñ	å% ‰…¹•±…µ•¹Ñ¼´ˆ€¬Á…É…µÌ¹¡…Ù”¤ì4(4(€¥˜€ ……É•„¤É•ÑÕÉ¸ì4(4(€½¹ÍÐ•µ…¥±%¹ÁÕÐ€ô…É•„¹ÅÕ•ÉåM•±•Ñ½È ˆ¹•µ…¥°µ…¹•±…µ•¹Ñ¼ˆ¤ì4(€½¹ÍÐµ•¹Í…•µ…¹•±…µ•¹Ñ¼€ô…É•„¹ÅÕ•ÉåM•±•Ñ½È ˆ¹µ•¹Í…•´µ…¹•±…µ•¹Ñ¼ˆ¤ì4(€½¹ÍÐ‰½Ñ…¼€ô…É•„¹ÅÕ•ÉåM•±•Ñ½È ˆ¹‰½Ñ…¼µ•¹Ù¥…Èµ½‘¥¼ˆ¤ì4(4(€½¹ÍÐ•µ…¥°€ô¹½Éµ…±¥é…Éµ…¥°¡•µ…¥±%¹ÁÕÐ¹Ù…±Õ”¤ì4(€½¹ÍÐÉ½¹ÍÕ±Ñ…‘¼€ô±¥µÁ…ÉI¡Á…É…µÌ¹É½¹ÍÕ±Ñ„ñðÕ±Ñ¥µ½I½¹ÍÕ±Ñ…‘¼ñðÉ½¹ÍÕ±Ñ„¹Ù…±Õ”¤ì4(4(€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô€ˆˆì4(€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ9…µ”€ô€‰µ•¹Í…•´µ…¹•±…µ•¹Ñ¼ˆì4(4(€¥˜€ …É½¹ÍÕ±Ñ…‘¼¤ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰I‘„½¹ÍÕ±Ñ„»¼¥‘•¹Ñ¥™¥…‘¼¸ÑÕ…±¥é”„½¹ÍÕ±Ñ„”Ñ•¹Ñ”¹½Ù…µ•¹Ñ”¸ˆì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ1¥ÍÐ¹…‘ ‰•ÉÉ¼ˆ¤ì4(€€€É•ÑÕÉ¸ì4(€ô4(4(€½¹ÍÐ•ÉÉ½µ…¥°€ôÙ…±¥‘…Éµ…¥±…¹•±…µ•¹Ñ¼¡É½¹ÍÕ±Ñ…‘¼°•µ…¥°¤ì4(4(€¥˜€¡•ÉÉ½µ…¥°¤ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô•ÉÉ½µ…¥°ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ1¥ÍÐ¹…‘ ‰•ÉÉ¼ˆ¤ì4(€€€É•ÑÕÉ¸ì4(€ô4(4(€‰½Ñ…¼¹‘¥Í…‰±•€ôÑÉÕ”ì4(€‰½Ñ…¼¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰¹Ù¥…¹‘¼¸¸¸ˆì4(4(€ÑÉäì4(€€€½¹ÍÐÉ•ÍÕ±Ñ…‘¼€ô…Ý…¥Ð¡…µ…ÉÁ¤ ‰Í½±¥¥Ñ…É½‘¥½…¹•±…µ•¹Ñ½A•ÉµÕÑ„ˆ°µ½¹Ñ…ÉA…å±½…‘…¹•±…µ•¹Ñ¼¡Á…É…µÌ°ì4(€€€€€•µ…¥°è•µ…¥°°4(€€€€€•µ…¥±½¹™¥Éµ……¼è•µ…¥°4(€€€ô¤¤ì4(4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô4(€€€€€É•ÍÕ±Ñ…‘¼¹µ•¹Í…•´ñð€‰Í‘¥¼•¹Ù¥…‘¼Á…É„¼”µµ…¥°…‘…ÍÑÉ…‘¼¹¼I½¹ÍÕ±Ñ…‘¼¸ˆì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ1¥ÍÐ¹…‘ ‰ÍÕ•ÍÍ¼ˆ¤ì4(4(€ô…Ñ €¡•ÉÉ¼¤ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô•ÉÉ¼¹µ•ÍÍ…”ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ1¥ÍÐ¹…‘ ‰•ÉÉ¼ˆ¤ì4(4(€ô™¥¹…±±äì4(€€€‰½Ñ…¼¹‘¥Í…‰±•€ô™…±Í”ì4(€€€‰½Ñ…¼¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰¹Ù¥…ÈÍ‘¥¼ˆì4(€ô4)ô4(4)…Íå¹Œ™Õ¹Ñ¥½¸½¹™¥Éµ…É…¹•±…µ•¹Ñ¼¡Á…É…µÌ°É½¹ÍÕ±Ñ……¹•±…µ•¹Ñ¼¤ì4(€¥˜€ …Á…É…µÌñðÑåÁ•½˜Á…É…µÌ€„ôô€‰½‰©•Ðˆ¤ì4(€€€Á…É…µÌ€ôì4(€€€€€¡…Ù”èÁ…É…µÌ°4(€€€€€±¥¹¡„èÁ…É…µÌ°4(€€€€€¥‘A•ÉµÕÑ„èÁ…É…µÌ°4(€€€€€É½¹ÍÕ±Ñ„èÉ½¹ÍÕ±Ñ……¹•±…µ•¹Ñ¼4(€€€ôì4(€ô4(4(€½¹ÍÐ…É•„€ô‘½Õµ•¹Ð¹•Ñ±•µ•¹Ñ	å% ‰…¹•±…µ•¹Ñ¼´ˆ€¬Á…É…µÌ¹¡…Ù”¤ì4(4(€¥˜€ ……É•„¤É•ÑÕÉ¸ì4(4(€½¹ÍÐ•µ…¥±%¹ÁÕÐ€ô…É•„¹ÅÕ•ÉåM•±•Ñ½È ˆ¹•µ…¥°µ…¹•±…µ•¹Ñ¼ˆ¤ì4(€½¹ÍÐ½‘¥½%¹ÁÕÐ€ô…É•„¹ÅÕ•ÉåM•±•Ñ½È ˆ¹½‘¥¼µ…¹•±…µ•¹Ñ¼ˆ¤ì4(€½¹ÍÐµ•¹Í…•µ…¹•±…µ•¹Ñ¼€ô…É•„¹ÅÕ•ÉåM•±•Ñ½È ˆ¹µ•¹Í…•´µ…¹•±…µ•¹Ñ¼ˆ¤ì4(€½¹ÍÐ‰½Ñ…¼€ô…É•„¹ÅÕ•ÉåM•±•Ñ½È ˆ¹‰½Ñ…¼µ½¹™¥Éµ…Èµ…¹•±…µ•¹Ñ¼ˆ¤ì4(4(€½¹ÍÐ•µ…¥°€ô¹½Éµ…±¥é…Éµ…¥°¡•µ…¥±%¹ÁÕÐ¹Ù…±Õ”¤ì4(€½¹ÍÐ½‘¥¼€ôMÑÉ¥¹œ¡½‘¥½%¹ÁÕÐ¹Ù…±Õ”ñð€ˆˆ¤¹É•Á±…” ½q½œ°€ˆˆ¤¹Í±¥” À°€Ø¤ì4(€½¹ÍÐÉ½¹ÍÕ±Ñ…‘¼€ô±¥µÁ…ÉI¡Á…É…µÌ¹É½¹ÍÕ±Ñ„ñðÕ±Ñ¥µ½I½¹ÍÕ±Ñ…‘¼ñðÉ½¹ÍÕ±Ñ„¹Ù…±Õ”¤ì4(4(€½‘¥½%¹ÁÕÐ¹Ù…±Õ”€ô½‘¥¼ì4(€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô€ˆˆì4(€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ9…µ”€ô€‰µ•¹Í…•´µ…¹•±…µ•¹Ñ¼ˆì4(4(€¥˜€ …É½¹ÍÕ±Ñ…‘¼¤ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰I‘„½¹ÍÕ±Ñ„»¼¥‘•¹Ñ¥™¥…‘¼¸ÑÕ…±¥é”„½¹ÍÕ±Ñ„”Ñ•¹Ñ”¹½Ù…µ•¹Ñ”¸ˆì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ1¥ÍÐ¹…‘ ‰•ÉÉ¼ˆ¤ì4(€€€É•ÑÕÉ¸ì4(€ô4(4(€½¹ÍÐ•ÉÉ½µ…¥°€ôÙ…±¥‘…Éµ…¥±…¹•±…µ•¹Ñ¼¡É½¹ÍÕ±Ñ…‘¼°•µ…¥°¤ì4(4(€¥˜€¡•ÉÉ½µ…¥°¤ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô•ÉÉ½µ…¥°ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ1¥ÍÐ¹…‘ ‰•ÉÉ¼ˆ¤ì4(€€€É•ÑÕÉ¸ì4(€ô4(4(€¥˜€ …½‘¥¼¤ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰%¹™½Éµ”¼Í‘¥¼É••‰¥‘¼Á½È”µµ…¥°¸ˆì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ1¥ÍÐ¹…‘ ‰•ÉÉ¼ˆ¤ì4(€€€É•ÑÕÉ¸ì4(€ô4(4(€‰½Ñ…¼¹‘¥Í…‰±•€ôÑÉÕ”ì4(€‰½Ñ…¼¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰½¹™¥Éµ…¹‘¼¸¸¸ˆì4(4(€ÑÉäì4(€€€½¹ÍÐÉ•ÍÕ±Ñ…‘¼€ô…Ý…¥Ð¡…µ…ÉÁ¤ ‰½¹™¥Éµ…É…¹•±…µ•¹Ñ½A•ÉµÕÑ„ˆ°µ½¹Ñ…ÉA…å±½…‘…¹•±…µ•¹Ñ¼¡Á…É…µÌ°ì4(€€€€€•µ…¥°è•µ…¥°°4(€€€€€•µ…¥±½¹™¥Éµ……¼è•µ…¥°°4(€€€€€½‘¥¼è½‘¥¼4(€€€ô¤¤ì4(4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô4(€€€€€É•ÍÕ±Ñ…‘¼¹µ•¹Í…•´ñð€‰…¹•±…µ•¹Ñ¼É•¥ÍÑÉ…‘¼½´ÍÕ•ÍÍ¼¸ˆì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ1¥ÍÐ¹…‘ ‰ÍÕ•ÍÍ¼ˆ¤ì4(4(€€€Í•ÑQ¥µ•½ÕÐ  ¤€ôøì4(€€€€€½¹ÍÕ±Ñ…ÉA•ÉµÕÑ…ÍÕÑÕÉ…Ì ¤ì4(€€€ô°€ÄÈÀÀ¤ì4(4(€ô…Ñ €¡•ÉÉ¼¤ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹Ñ•áÑ½¹Ñ•¹Ð€ô•ÉÉ¼¹µ•ÍÍ…”ì4(€€€µ•¹Í…•µ…¹•±…µ•¹Ñ¼¹±…ÍÍ1¥ÍÐ¹…‘ ‰•ÉÉ¼ˆ¤ì4(4(€ô™¥¹…±±äì4(€€€‰½Ñ…¼¹‘¥Í…‰±•€ô™…±Í”ì4(€€€‰½Ñ…¼¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰½¹™¥Éµ…È…¹•±…µ•¹Ñ¼ˆì4(€ô4)ô4