import { useState, useEffect } from "react";
import { Lock, RefreshCw, Send, MapPin, Store, Truck } from "lucide-react";
import { CONFIG } from "./config";

const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatPhoneForWhats(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export default function Painel() {
  const [authed, setAuthed] = useState(false);
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erroCarregar, setErroCarregar] = useState("");

  const carregarPedidos = async () => {
    if (!CONFIG.sheetWebhookUrl) {
      setErroCarregar("Falta colar a URL da planilha (sheetWebhookUrl) em src/config.js.");
      return;
    }
    setLoading(true);
    setErroCarregar("");
    try {
      const res = await fetch(CONFIG.sheetWebhookUrl);
      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
    } catch {
      setErroCarregar("Não consegui carregar os pedidos agora. Tente atualizar de novo em instantes.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authed) carregarPedidos();
  }, [authed]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (senha === CONFIG.painelSenha) {
      setAuthed(true);
      setErroLogin("");
    } else {
      setErroLogin("Senha incorreta.");
    }
  };

  const avisarSaiuEntrega = (pedido) => {
    const tel = formatPhoneForWhats(pedido["Telefone"]);
    if (!tel) return;
    const msg = encodeURIComponent(
      `Oi, ${pedido["Nome"]}! Seu pedido da ${CONFIG.brandName} saiu para entrega. 🍮`
    );
    window.open(`https://wa.me/${tel}?text=${msg}`, "_blank");
  };

  if (!authed) {
    return (
      <div style={{ background: "#FBEEE6", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }} className="flex items-center justify-center px-4">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');`}</style>
        <form
          onSubmit={handleLogin}
          style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }}
          className="w-full max-w-sm rounded-2xl border p-6"
        >
          <div className="flex items-center gap-2 mb-4" style={{ color: "#C85C68" }}>
            <Lock size={18} />
            <h1 style={{ fontFamily: "'Fraunces', serif" }} className="text-lg font-semibold">
              Painel {CONFIG.brandName}
            </h1>
          </div>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            style={{ background: "#FBEEE6", borderColor: "#F0C9CD", color: "#4A2E22" }}
            className="w-full rounded-xl border p-3 text-sm mb-3"
          />
          {erroLogin && <p className="text-sm text-red-600 mb-3">{erroLogin}</p>}
          <button
            type="submit"
            style={{ background: "#C85C68", color: "#FFFDFB" }}
            className="w-full rounded-lg py-3 font-bold text-sm uppercase tracking-wide"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: "#FBEEE6", minHeight: "100vh", color: "#4A2E22", fontFamily: "'Inter', sans-serif" }} className="px-4 py-8">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontFamily: "'Fraunces', serif", color: "#C85C68" }} className="text-2xl font-semibold">
            Pedidos
          </h1>
          <button
            onClick={carregarPedidos}
            style={{ borderColor: "#C85C68", color: "#C85C68" }}
            className="flex items-center gap-1 text-sm border rounded-full px-3 py-1.5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>

        {erroCarregar && <p className="text-sm text-red-600 mb-4">{erroCarregar}</p>}

        {pedidos.length === 0 && !loading && !erroCarregar && (
          <p style={{ color: "#8A5A54" }} className="text-sm">
            Nenhum pedido ainda.
          </p>
        )}

        <div className="space-y-3">
          {pedidos.map((p, idx) => (
            <div key={idx} style={{ background: "#FFFDFB", borderColor: "#F0C9CD" }} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold">{p["Nome"]}</p>
                  <p style={{ color: "#8A5A54" }} className="text-xs">
                    {p["Telefone"]}
                  </p>
                </div>
                <span
                  style={{ background: "#F0C9CD", color: "#8B2E37" }}
                  className="text-xs font-bold rounded-lg px-2 py-1 shrink-0"
                >
                  {typeof p["Total"] === "number" ? money(p["Total"]) : p["Total"]}
                </span>
              </div>
              <p className="text-sm mb-1">{p["Itens"]}</p>
              <div style={{ color: "#8A5A54" }} className="text-xs flex items-center gap-1 mb-1">
                {p["Tipo"] === "retirada" ? <Store size={12} /> : <Truck size={12} />}
                {p["Tipo"] === "retirada" ? "Retirada" : `Entrega — ${p["Região"] || ""}`}
              </div>
              {p["Endereço"] && (
                <div style={{ color: "#8A5A54" }} className="text-xs flex items-center gap-1 mb-1">
                  <MapPin size={12} /> {p["Endereço"]}
                </div>
              )}
              <p style={{ color: "#8A5A54" }} className="text-xs mb-3">
                Data desejada: {p["Data desejada"]} {p["Hora"] ? `às ${p["Hora"]}` : ""}
              </p>
              {p["Tipo"] === "entrega" && (
                <button
                  onClick={() => avisarSaiuEntrega(p)}
                  style={{ background: "#C85C68", color: "#FFFDFB" }}
                  className="flex items-center gap-2 text-xs font-bold rounded-lg px-3 py-2"
                >
                  <Send size={12} />
                  Avisar que saiu para entrega
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
