function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Data/Hora", "Nome", "Telefone", "Tipo", "Região", "Endereço",
      "Data desejada", "Itens", "Subtotal", "Frete", "Total", "Observações"
    ]);
  }

  sheet.appendRow([
    new Date(),
    data.nome,
    data.telefone,
    data.tipo,
    data.regiao,
    data.endereco,
    data.data,
    data.itens,
    data.subtotal,
    data.frete,
    data.total,
    data.observacoes
  ]);

  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
