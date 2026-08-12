/* ============================================================
   CONFIGURAÇÃO — edite aqui os dados reais da Doce Momento
   ============================================================ */
export const CONFIG = {
  brandName: "Doce Momento",
  tagline: "Feito com amor para adoçar seus momentos",
  city: "Paiçandu, PR",
  whatsappNumber: "5544999887582", // troque pelo número real (DDI+DDD+número, só dígitos)
  pickupAddress: "Endereço para retirada — Paiçandu, PR", // troque pelo endereço real
  sheetWebhookUrl: "", // cole aqui a URL do Apps Script (veja SETUP.md) — usada pra registrar E pra ler os pedidos
  painelSenha: "docemomento123", // troque por uma senha só dela — protege o /painel
  menu: [
    { id: "individual", name: "Pudim individual", size: "120 ml", price: 10 },
    { id: "medio", name: "Pudim médio", size: "500 ml", price: 30 },
    { id: "familia", name: "Pudim tamanho família", size: "1,1 L", price: 60 },
  ],
  regions: [
    { id: "centro", name: "Centro", fee: 5 },
    { id: "proxima", name: "Região próxima", fee: 7 },
    { id: "distante", name: "Região mais distante", fee: 10 },
    { id: "outra", name: "Outra região (combinar)", fee: null },
  ],
};
/* ============================================================ */
