import { useState, useMemo } from "react";
import { Minus, Plus, MapPin, Store, Truck, Send, Info, Heart } from "lucide-react";

/* ============================================================
   CONFIGURAÇÃO — edite aqui os dados reais da Doce Momento
   ============================================================ */
const CONFIG = {
  brandName: "Doce Momento",
  tagline: "Feito com amor para adoçar seus momentos",
  city: "Paiçandu, PR",
  whatsappNumber: "5544999999999", // troque pelo número real (DDI+DDD+número, só dígitos)
  pickupAddress: "Endereço para retirada — Paiçandu, PR", // troque pelo endereço real
  sheetWebhookUrl: "", // cole aqui a URL do Apps Script (veja SETUP.md) para os pedidos caírem numa planilha
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

const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function App() {
  const [cart, setCart] = useState({});
  const [orderType, setOrderType] = useState("retirada");
  const [regionId, setRegionId] = useState("");
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  const region = CONFIG.regions.find((r) => r.id === regionId);

  const cartItems = useMemo(
    () =>
      CONFIG.menu
        .map((item) => ({ ...item, qty: cart[item.id] || 0 }))
        .filter((item) => item.qty > 0),
    [cart]
  );

  const subtotal = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const deliveryFee = orderType === "entrega" ? region?.fee ?? 0 : 0;
  const total = subtotal + deliveryFee;

  const setQty = (id, delta) =>
    setCart((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });

  const missing = [];
  if (cartItems.length === 0) missing.push("escolha pelo menos um pudim");
  if (!name.trim()) missing.push("seu nome");
  if (!phone.trim()) missing.push("seu telefone");
  if (!date) missing.push("data desejada");
  if (orderType === "entrega" && !regionId) missing.push("a região da entrega");
  if (orderType === "entrega" && !address.trim()) missing.push("o endereço de entrega");
  const canSend = missing.length === 0;

  const buildMessage = () => {
    const lines = [];
    lines.push(`*Novo pedido — ${CONFIG.brandName}*`);
    lines.push("");
    lines.push("*Itens:*");
    cartItems.forEach((i) => lines.push(`${i.qty}x ${i.name} (${i.size}) — ${money(i.qty * i.price)}`));
    lines.push("");
    lines.push(`Subtotal: ${money(subtotal)}`);
    if (orderType === "entrega") {
      lines.push(
        region?.fee != null
          ? `Frete (${region.name}): ${money(region.fee)}`
          : `Frete (${region?.name || "a combinar"}): a combinar`
      );
    }
    lines.push(`*Total: ${money(total)}${orderType === "entrega" && region?.fee == null ? " + frete a combinar" : ""}*`);
    lines.push("");
    lines.push(orderType === "retirada" ? "*Retirada no local*" : "*Entrega*");
    if (orderType === "retirada") {
      lines.push(CONFIG.pickupAddress);
    } else {
      lines.push(`Região: ${region?.name || "-"}`);
      lines.push(`Endereço: ${address}`);
    }
    lines.push(`Data desejada: ${new Date(date + "T00:00:00").toLocaleDateString("pt-BR")}`);
    lines.push("");
    lines.push(`Nome: ${name}`);
    lines.push(`Telefone: ${phone}`);
    if (notes.trim()) lines.push(`Observações: ${notes}`);
    lines.push("");
    lines.push("_Pedido enviado pelo app — aguardando sua confirmação de dia/horário._");
    return lines.join("\n");
  };

  const logToSheet = () => {
    if (!CONFIG.sheetWebhookUrl) return;
    try {
      fetch(CONFIG.sheetWebhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          nome: name,
          telefone: phone,
          tipo: orderType,
          regiao: orderType === "entrega" ? region?.name || "" : "",
          endereco: orderType === "entrega" ? address : CONFIG.pickupAddress,
          data: date,
          itens: cartItems.map((i) => `${i.qty}x ${i.name}`).join(", "),
          subtotal,
          frete: deliveryFee,
          total,
          observacoes: notes,
        }),
      });
    } catch {
      // se a planilha falhar, o pedido ainda vai normalmente pro WhatsApp
    }
  };

  const handleSend = () => {
    if (!canSend) return;
    const text = encodeURIComponent(buildMessage());
    logToSheet();
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${text}`, "_blank");
    setSent(true);
  };

  return (
    <div style={{ background: "#FBEEE6", minHeight: "100%", fontFamily: "'Inter', sans-serif", color: "#4A2E22" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .ticket-edge {
          background-image:
            linear-gradient(135deg, #FFFDFB 25%, transparent 25%) -7px 0/14px 14px repeat-x,
            linear-gradient(225deg, #FFFDFB 25%, transparent 25%) -7px 0/14px 14px repeat-x;
          height: 10px;
        }
        .stamp-btn { transform: rotate(-1.5deg); transition: transform .15s ease; }
        .stamp-btn:hover:not(:disabled) { transform: rotate(0deg) scale(1.02); }
      `}</style>

      {/* Hero */}
      <div className="px-6 pt-10 pb-8 text-center relative overflow-hidden">
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: "9999px",
            border: "2px solid #C85C68",
            margin: "0 auto 14px",
          }}
          className="flex flex-col items-center justify-center"
        >
          <span style={{ fontFamily: "'Fraunces', serif", color: "#4A2E22", fontWeight: 700, fontSize: 14 }}>
            Doce
          </span>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", color: "#C85C68", fontSize: 15 }}>
            Momento
          </span>
        </div>
        <p style={{ color: "#8A5A54" }} className="text-xs tracking-widest uppercase mb-1">
          {CONFIG.city}
        </p>
        <h1
          style={{ fontFamily: "'Fraunces', serif", color: "#C85C68" }}
          className="text-3xl font-bold mb-2 flex items-center justify-center gap-2"
        >
          <Heart size={18} fill="#C85C68" /> {CONFIG.tagline} <Heart size={18} fill="#C85C68" />
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-8 lg:grid lg:grid-cols-[1fr,340px] lg:gap-8 lg:items-start">
        <div>
          {/* Cardápio */}
          <section className="mb-8">
            <div
              style={{ background: "#3A241C", color: "#FBEEE6" }}
              className="inline-block rounded-full px-5 py-2 text-sm font-bold uppercase tracking-widest mb-4"
            >
              Nossos Pudins
            </div>
            <div className="space-y-3">
              {CONFIG.menu.map((item) => (
                <div
                  key={item.id}
                  style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }}
                  className="flex items-center justify-between gap-3 rounded-2xl border p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      style={{ background: "#F0C9CD", color: "#C85C68" }}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    >
                      {item.size.replace(" ", "\n")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p style={{ color: "#8A5A54" }} className="text-xs">
                        {item.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      style={{ background: "#F0C9CD", color: "#8B2E37" }}
                      className="rounded-lg px-2.5 py-1 text-sm font-bold"
                    >
                      {money(item.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(item.id, -1)}
                        style={{ borderColor: "#C85C68" }}
                        className="w-7 h-7 rounded-full border flex items-center justify-center"
                        aria-label={`Diminuir ${item.name}`}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-4 text-center font-medium text-sm">{cart[item.id] || 0}</span>
                      <button
                        onClick={() => setQty(item.id, 1)}
                        style={{ background: "#C85C68" }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                        aria-label={`Aumentar ${item.name}`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tipo de pedido */}
          <section className="mb-8">
            <h2 style={{ fontFamily: "'Fraunces', serif", color: "#C85C68" }} className="text-xl font-semibold mb-4">
              Retirada ou entrega?
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setOrderType("retirada")}
                style={{
                  background: orderType === "retirada" ? "#3A241C" : "#FFFDFB",
                  color: orderType === "retirada" ? "#FBEEE6" : "#4A2E22",
                  borderColor: "#F0C9CD",
                }}
                className="rounded-xl border py-3 flex flex-col items-center gap-1 text-sm font-medium"
              >
                <Store size={18} />
                Retirar no local
              </button>
              <button
                onClick={() => setOrderType("entrega")}
                style={{
                  background: orderType === "entrega" ? "#3A241C" : "#FFFDFB",
                  color: orderType === "entrega" ? "#FBEEE6" : "#4A2E22",
                  borderColor: "#F0C9CD",
                }}
                className="rounded-xl border py-3 flex flex-col items-center gap-1 text-sm font-medium"
              >
                <Truck size={18} />
                Receber em casa
              </button>
            </div>

            {orderType === "retirada" ? (
              <div style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }} className="rounded-xl border p-4 flex gap-3">
                <MapPin size={18} style={{ color: "#C85C68" }} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Endereço para retirada</p>
                  <p style={{ color: "#8A5A54" }} className="text-sm">
                    {CONFIG.pickupAddress}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Região da entrega</label>
                  <select
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }}
                    className="w-full rounded-xl border p-3 text-sm"
                  >
                    <option value="">Selecione a região</option>
                    {CONFIG.regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.fee != null ? `— ${money(r.fee)}` : "— a combinar"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Endereço completo</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, complemento"
                    style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }}
                    className="w-full rounded-xl border p-3 text-sm"
                  />
                </div>
                <div style={{ color: "#8A5A54" }} className="flex items-start gap-2 text-xs">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>
                    O valor da entrega é uma estimativa por região. A confirmação final do dia e da rota é
                    combinada por WhatsApp.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Dados */}
          <section className="mb-8">
            <h2 style={{ fontFamily: "'Fraunces', serif", color: "#C85C68" }} className="text-xl font-semibold mb-4">
              Seus dados
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Data desejada</label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }}
                  className="w-full rounded-xl border p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Nome</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }}
                  className="w-full rounded-xl border p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Telefone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(44) 9 9999-9999"
                  style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }}
                  className="w-full rounded-xl border p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Observações (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Ponto de referência, horário preferido..."
                  style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }}
                  className="w-full rounded-xl border p-3 text-sm resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Ticket / resumo */}
        <div className="lg:sticky lg:top-6">
          <div className="ticket-edge rounded-t" />
          <div style={{ background: "#FFFDFB" }} className="px-5 py-5">
            <p
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8A5A54" }}
              className="text-xs uppercase tracking-widest mb-3"
            >
              Resumo do pedido
            </p>

            {cartItems.length === 0 ? (
              <p style={{ color: "#8A5A54" }} className="text-sm py-4">
                Escolha os pudins para montar seu pedido.
              </p>
            ) : (
              <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-sm space-y-1.5 mb-3">
                {cartItems.map((i) => (
                  <div key={i.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {i.qty}x {i.name}
                    </span>
                    <span className="shrink-0">{money(i.qty * i.price)}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderColor: "#F0C9CD" }} className="border-t border-dashed my-3" />

            <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-sm space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              {orderType === "entrega" && (
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{region?.fee != null ? money(region.fee) : "a combinar"}</span>
                </div>
              )}
              <div style={{ borderColor: "#F0C9CD" }} className="border-t border-dashed my-2" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!canSend}
              style={{
                background: canSend ? "#C85C68" : "#F0C9CD",
                color: "#FFFDFB",
                borderColor: "#3A241C",
              }}
              className="stamp-btn w-full mt-5 rounded-lg border-2 py-3 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              Enviar pedido no WhatsApp
            </button>

            {!canSend && (
              <p style={{ color: "#8A5A54" }} className="text-xs mt-2 text-center">
                Falta: {missing.join(", ")}
              </p>
            )}
            {sent && (
              <p style={{ color: "#5C7A4A" }} className="text-xs mt-2 text-center font-medium">
                Pedido enviado! Aguarde a confirmação por WhatsApp.
              </p>
            )}
          </div>
          <div className="ticket-edge rounded-b" style={{ transform: "rotate(180deg)" }} />
        </div>
      </div>
    </div>
  );
}
