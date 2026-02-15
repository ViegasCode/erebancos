import { useRef, useState } from "react";
import { OrdemServico, Cliente } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";

interface PrintOSProps {
  os: OrdemServico;
  cliente?: Cliente;
}

function OSFicha({ os, cliente, copy, total }: PrintOSProps & { copy: number; total: number }) {
  return (
    <div className="print-ficha" style={{ pageBreakAfter: copy < total ? "always" : "auto" }}>
      <div style={{ border: "2px solid #1e3a5f", borderRadius: 8, padding: 24, fontFamily: "Arial, sans-serif", color: "#1a1a1a", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", borderBottom: "2px solid #1e3a5f", paddingBottom: 12, marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>ERÊ BANCOS</h1>
          <p style={{ fontSize: 11, color: "#666", margin: "4px 0 0" }}>Bancos Customizados para Motos</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 13 }}>
          <div><strong>OS Nº:</strong> {os.numero_os}</div>
          <div><strong>Data:</strong> {formatDate(os.created_at)}</div>
          <div><strong>Previsão:</strong> {formatDate(os.data_previsao)}</div>
          <div><strong>Status:</strong> {os.status}</div>
        </div>

        <div style={{ background: "#f5f7fa", borderRadius: 6, padding: 12, marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", margin: "0 0 8px" }}>CLIENTE</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 12 }}>
            <div><strong>Nome:</strong> {cliente?.nome || "—"}</div>
            <div><strong>CPF:</strong> {cliente?.cpf || "—"}</div>
            <div><strong>Telefone:</strong> {cliente?.telefone || "—"}</div>
            <div><strong>Email:</strong> {cliente?.email || "—"}</div>
          </div>
        </div>

        <div style={{ background: "#f5f7fa", borderRadius: 6, padding: 12, marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", margin: "0 0 8px" }}>MOTO</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "4px 16px", fontSize: 12 }}>
            <div><strong>Marca:</strong> {os.marca}</div>
            <div><strong>Modelo:</strong> {os.modelo}</div>
            <div><strong>Cilindrada:</strong> {os.cilindrada || "—"}</div>
            <div><strong>Ano:</strong> {os.ano || "—"}</div>
          </div>
        </div>

        <div style={{ background: "#f5f7fa", borderRadius: 6, padding: 12, marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", margin: "0 0 8px" }}>SERVIÇOS</h3>
          {os.servicos.map((srv, i) => (
            <div key={i} style={{ fontSize: 12, marginBottom: 6, paddingBottom: 4, borderBottom: i < os.servicos.length - 1 ? "1px solid #ddd" : "none" }}>
              <div><strong>Serviço {i + 1}:</strong> {srv.descricao}</div>
              {srv.material && <div style={{ color: "#666" }}>Material: {srv.material}</div>}
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 16px", fontSize: 12, marginTop: 8 }}>
            <div><strong>Tipo:</strong> {os.tipo}</div>
            <div><strong>Vendedor:</strong> {os.vendedor}</div>
            <div><strong>Local:</strong> {os.local_compra}{os.influencer ? ` (${os.influencer})` : ""}</div>
          </div>
        </div>

        <div style={{ background: "#f5f7fa", borderRadius: 6, padding: 12, marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", margin: "0 0 8px" }}>PAGAMENTO</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "4px 16px", fontSize: 12 }}>
            <div><strong>Valor:</strong> {formatCurrency(os.valor)}</div>
            <div><strong>Desconto:</strong> {formatCurrency(os.desconto)}</div>
            <div><strong>Frete:</strong> {formatCurrency(os.frete)}</div>
            <div><strong>Total:</strong> {formatCurrency(os.total_venda)}</div>
          </div>
          <div style={{ fontSize: 12, marginTop: 8 }}>
            <strong>Formas:</strong> {os.pagamentos.map((p) => `${p.forma}: ${formatCurrency(p.valor)}`).join(" | ")}
          </div>
        </div>

        <div style={{ background: "#f5f7fa", borderRadius: 6, padding: 12, marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", margin: "0 0 8px" }}>DADOS TÉCNICOS</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "4px 16px", fontSize: 12 }}>
            <div><strong>Peso Piloto:</strong> {os.peso_piloto || "—"}</div>
            <div><strong>Altura Piloto:</strong> {os.altura_piloto || "—"}</div>
            <div><strong>Peso Garupa:</strong> {os.peso_garupa || "—"}</div>
            <div><strong>Altura Garupa:</strong> {os.altura_garupa || "—"}</div>
            <div><strong>Cóccix:</strong> {os.coccix || "Sem ajuste"}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #ddd", paddingTop: 16, fontSize: 11 }}>
          <div style={{ borderTop: "1px solid #333", paddingTop: 4, width: "45%", textAlign: "center" }}>Assinatura do Cliente</div>
          <div style={{ borderTop: "1px solid #333", paddingTop: 4, width: "45%", textAlign: "center" }}>Assinatura ERÊ Bancos</div>
        </div>

        {total > 1 && (
          <div style={{ textAlign: "right", fontSize: 10, color: "#999", marginTop: 8 }}>
            Via {copy} de {total}
          </div>
        )}
      </div>
    </div>
  );
}

export function PrintOSButton({ os, cliente }: PrintOSProps) {
  const [open, setOpen] = useState(false);
  const [copies, setCopies] = useState(2);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>OS #${os.numero_os} - ERÊ Bancos</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { padding: 16px; }
            .print-ficha { margin-bottom: 16px; }
            @media print {
              body { padding: 0; }
              .print-ficha { margin-bottom: 0; }
            }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);

    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Printer className="h-4 w-4" /> Imprimir OS
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Imprimir OS #{os.numero_os}</DialogTitle>
            <DialogDescription>Escolha quantas cópias deseja imprimir.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <Label htmlFor="copies">Número de cópias</Label>
            <Input
              id="copies"
              type="number"
              min={1}
              max={10}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Math.min(10, Number(e.target.value))))}
              className="w-20"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div ref={printRef} className="hidden">
        {Array.from({ length: copies }, (_, i) => (
          <OSFicha key={i} os={os} cliente={cliente} copy={i + 1} total={copies} />
        ))}
      </div>
    </>
  );
}
