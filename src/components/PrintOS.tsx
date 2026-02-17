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

const cell: React.CSSProperties = { border: "1px solid #000", padding: "2px 6px", fontSize: 11 };
const lbl: React.CSSProperties = { fontWeight: "bold", fontSize: 10 };
const box: React.CSSProperties = { display: "inline-block", width: 13, height: 13, border: "1.5px solid #000", margin: "0 4px", verticalAlign: "middle" };
const boxChecked: React.CSSProperties = { ...box, background: "#000" };

function Chk({ checked }: { checked: boolean }) {
  return <span style={checked ? boxChecked : box} />;
}

function FichaCompleta({ os, cliente }: PrintOSProps) {
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000", width: "100%", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ padding: "4px 8px", fontSize: 18, fontWeight: 900, letterSpacing: 2 }}>
              ERÊ <span style={{ fontSize: 11, fontWeight: 400, letterSpacing: 0 }}>Equipamentos para veículos Automotores Ltda.</span>
            </td>
            <td style={{ textAlign: "right", padding: "4px 8px" }}>
              <span style={{ fontSize: 11 }}>OS: </span>
              <span style={{ fontSize: 26, fontWeight: 900, color: "#c00", letterSpacing: 2 }}>{os.numero_os}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Client info */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
        <tbody>
          <tr>
            <td style={cell}><span style={lbl}>DATA:</span> {formatDate(os.created_at)}</td>
            <td style={cell} colSpan={2}><span style={lbl}>NOME:</span> {cliente?.nome || "—"}</td>
            <td style={cell}><span style={lbl}>TEL:</span> {cliente?.telefone || "—"}</td>
          </tr>
          <tr>
            <td style={cell} colSpan={4}><span style={lbl}>END:</span> {cliente?.rua ? `${cliente.rua}, ${cliente.numero || "S/N"}` : "—"}</td>
          </tr>
          <tr>
            <td style={cell}><span style={lbl}>BAIRRO:</span> {cliente?.bairro || "—"}</td>
            <td style={cell}><span style={lbl}>CIDADE:</span> {cliente?.cidade || "—"}</td>
            <td style={cell}><span style={lbl}>ESTADO:</span> {cliente?.estado || "—"}</td>
            <td style={cell}><span style={lbl}>CEP:</span> {cliente?.cep || "—"}</td>
          </tr>
          <tr>
            <td style={cell}><span style={lbl}>CPF:</span> {cliente?.cpf || "—"}</td>
            <td style={cell}><span style={lbl}>PAGTO:</span> {os.pagamentos.map(p => `${p.forma}: ${formatCurrency(p.valor)}`).join(" / ")}</td>
            <td style={cell} colSpan={2}><span style={lbl}>P/DIA:</span> {formatDate(os.data_previsao)}</td>
          </tr>
          <tr>
            <td style={cell}><span style={lbl}>MARCA:</span> {os.marca}</td>
            <td style={cell}><span style={lbl}>MOD:</span> {os.modelo}</td>
            <td style={cell}><span style={lbl}>CILINDRADA:</span> {os.cilindrada || "—"}</td>
            <td style={cell}><span style={lbl}>ANO:</span> {os.ano || "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* Services header */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", borderTop: "none" }}>
        <tbody>
          <tr>
            <td style={{ ...cell, padding: "6px 8px", verticalAlign: "middle" }}>
              <span style={{ fontSize: 16, fontWeight: 900, marginRight: 24 }}>SERVIÇOS</span>
              <span style={{ fontSize: 11, marginRight: 12 }}>TESTE <Chk checked={os.tipo === "Teste"} /></span>
              <span style={{ fontSize: 11, marginRight: 12 }}>RETIRADA <Chk checked={os.tipo === "Retirada"} /></span>
              <span style={{ fontSize: 11 }}>ENVIO <Chk checked={os.tipo === "Envio"} /></span>
            </td>
            <td style={{ border: "1px solid #000", padding: "6px 8px", fontWeight: 900, fontSize: 13, textAlign: "center", width: 80 }}>VALOR</td>
          </tr>
        </tbody>
      </table>

      {/* Services lines */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", borderTop: "none" }}>
        <tbody>
          {Array.from({ length: Math.max(8, os.servicos.length) }, (_, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #ccc", borderLeft: "1px solid #000", borderRight: "none", padding: "3px 8px", fontSize: 11, height: 20 }}>
                {os.servicos[i] ? `${os.servicos[i].descricao}${os.servicos[i].material ? ` — Material: ${os.servicos[i].material}` : ""}` : ""}
              </td>
              <td style={{ border: "1px solid #ccc", borderRight: "1px solid #000", borderLeft: "1px solid #000", padding: "3px 8px", fontSize: 11, width: 80, textAlign: "right" }}>
                {i === 0 ? formatCurrency(os.valor) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom: technical data */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", borderTop: "1px solid #000" }}>
        <tbody>
          <tr>
            <td style={cell}><span style={lbl}>PILOTO: PESO</span> {os.peso_piloto || "—"}</td>
            <td style={cell}><span style={lbl}>ALTURA</span> {os.altura_piloto || "—"}</td>
            <td style={cell}><span style={lbl}>VENDEDOR</span> {os.vendedor}</td>
            <td style={{ ...cell, fontWeight: 900, fontSize: 14, textAlign: "center" }} rowSpan={2}>
              <span style={lbl}>TOTAL</span><br />{formatCurrency(os.total_venda)}
            </td>
          </tr>
          <tr>
            <td style={cell}><span style={lbl}>GARUPA: PESO</span> {os.peso_garupa || "—"}</td>
            <td style={cell}><span style={lbl}>ALTURA</span> {os.altura_garupa || "—"}</td>
            <td style={cell}><span style={lbl}>CÓCCIX</span> {os.coccix || "—"} &nbsp;<span style={lbl}>MATERIAL</span> {os.servicos[0]?.material || "—"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function FichaResumida({ os, cliente }: PrintOSProps) {
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000", width: "100%", maxWidth: 720, margin: "16px auto 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
        <tbody>
          <tr>
            <td style={{ ...cell, padding: "6px 8px" }} colSpan={3}>
              <span style={{ fontSize: 16, fontWeight: 900, marginRight: 20 }}>SERVIÇOS</span>
              <span style={{ fontSize: 11, marginRight: 10 }}>TESTE <Chk checked={os.tipo === "Teste"} /></span>
              <span style={{ fontSize: 11, marginRight: 10 }}>RETIRADA <Chk checked={os.tipo === "Retirada"} /></span>
              <span style={{ fontSize: 11 }}>ENVIO <Chk checked={os.tipo === "Envio"} /></span>
            </td>
            <td style={{ ...cell, textAlign: "right", padding: "6px 8px" }}>
              <span style={{ fontSize: 11 }}>OS: </span>
              <span style={{ fontSize: 18, fontWeight: 900 }}>{os.numero_os}</span>
            </td>
          </tr>
          <tr>
            <td style={cell}><span style={lbl}>DATA:</span> {formatDate(os.created_at)}</td>
            <td style={cell} colSpan={2}><span style={lbl}>NOME:</span> {cliente?.nome || "—"}</td>
            <td style={cell}><span style={lbl}>TEL:</span> {cliente?.telefone || "—"}</td>
          </tr>
          <tr>
            <td style={cell}><span style={lbl}>MARCA:</span> {os.marca}</td>
            <td style={cell}><span style={lbl}>MOD:</span> {os.modelo}</td>
            <td style={cell}><span style={lbl}>CILINDRADA:</span> {os.cilindrada || "—"}</td>
            <td style={cell}><span style={lbl}>ANO:</span> {os.ano || "—"}</td>
          </tr>
          <tr>
            <td style={cell} colSpan={3}>{os.servicos.map(s => s.descricao).join("; ")}</td>
            <td style={cell}><span style={lbl}>P/DIA:</span> {formatDate(os.data_previsao)}</td>
          </tr>
        </tbody>
      </table>

      {/* Lines */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", borderTop: "none" }}>
        <tbody>
          {Array.from({ length: Math.max(4, os.servicos.length) }, (_, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #ccc", borderLeft: "1px solid #000", borderRight: "1px solid #000", padding: "3px 8px", fontSize: 11, height: 18 }}>
                {os.servicos[i] ? `${os.servicos[i].descricao}${os.servicos[i].material ? ` — ${os.servicos[i].material}` : ""}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", borderTop: "1px solid #000" }}>
        <tbody>
          <tr>
            <td style={cell}><span style={lbl}>PILOTO: PESO</span> {os.peso_piloto || "—"}</td>
            <td style={cell}><span style={lbl}>ALTURA</span> {os.altura_piloto || "—"}</td>
            <td style={cell}><span style={lbl}>VENDEDOR</span> {os.vendedor}</td>
          </tr>
          <tr>
            <td style={cell}><span style={lbl}>GARUPA: PESO</span> {os.peso_garupa || "—"}</td>
            <td style={cell}><span style={lbl}>ALTURA</span> {os.altura_garupa || "—"}</td>
            <td style={cell}><span style={lbl}>CÓCCIX</span> {os.coccix || "—"} &nbsp;<span style={lbl}>MATERIAL</span> {os.servicos[0]?.material || "—"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function FichaRecibo({ os, cliente }: PrintOSProps) {
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000", width: "100%", maxWidth: 720, margin: "16px auto 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
        <tbody>
          <tr>
            <td style={cell} colSpan={2}><span style={lbl}>NOME:</span> {cliente?.nome || "—"}</td>
            <td style={{ ...cell, textAlign: "right" }} rowSpan={3}>
              <span style={{ fontSize: 11 }}>OS: </span>
              <span style={{ fontSize: 18, fontWeight: 900 }}>{os.numero_os}</span>
            </td>
          </tr>
          <tr>
            <td style={cell} colSpan={2}><span style={lbl}>TIPO DO PRODUTO:</span> {os.servicos.map(s => s.descricao).join("; ")}</td>
          </tr>
          <tr>
            <td style={cell}><span style={lbl}>CONDIÇÕES DE PAGTO:</span> {os.pagamentos.map(p => `${p.forma}: ${formatCurrency(p.valor)}`).join(" / ")}</td>
            <td style={cell}><span style={lbl}>VALOR TOTAL:</span> <span style={{ fontWeight: 900 }}>{formatCurrency(os.total_venda)}</span></td>
          </tr>
        </tbody>
      </table>
      <div style={{ textAlign: "center", fontSize: 10, padding: "4px 0", borderLeft: "1px solid #000", borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>
        ERÊ: Rua Francisco Manuel, 43 - Benfica - RJ - Tel: 3860-0157 / 3860-0106
      </div>
      <div style={{ textAlign: "center", fontSize: 9, padding: "3px 0", borderLeft: "1px solid #000", borderRight: "1px solid #000", borderBottom: "1px solid #000", lineHeight: 1.4 }}>
        <strong>NÃO ATENDEMOS NO HORÁRIO DAS 12:00 ÀS 13:00H - HORA DE ALMOÇO (de Segunda a sexta-feira)</strong><br />
        Observação: As mercadorias não retiradas no prazo de noventa dias, a empresa não terá responsabilidade sobre a mesma.
      </div>
      <div style={{ textAlign: "center", fontSize: 10, padding: "4px 0", borderLeft: "1px solid #000", borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>
        <strong>📷 Erebancos / 📘 Erebancos / 📞 98880-2749</strong>
      </div>
    </div>
  );
}

function OSPage({ os, cliente, copy, total }: PrintOSProps & { copy: number; total: number }) {
  return (
    <div className="print-page" style={{ pageBreakAfter: copy < total ? "always" : "auto", padding: "8px 0" }}>
      <FichaCompleta os={os} cliente={cliente} />
      <FichaResumida os={os} cliente={cliente} />
      <FichaRecibo os={os} cliente={cliente} />
      {total > 1 && (
        <div style={{ textAlign: "right", fontSize: 9, color: "#999", marginTop: 4, maxWidth: 720, margin: "4px auto 0" }}>Via {copy} de {total}</div>
      )}
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
    win.document.write(`<html><head><title>OS #${os.numero_os} - ERÊ Bancos</title><style>*{margin:0;padding:0;box-sizing:border-box}body{padding:12px;font-family:Arial,Helvetica,sans-serif}.print-page{margin-bottom:12px}@media print{body{padding:0}.print-page{margin-bottom:0}}</style></head><body>${printContent.innerHTML}</body></html>`);
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
            <Input id="copies" type="number" min={1} max={10} value={copies} onChange={(e) => setCopies(Math.max(1, Math.min(10, Number(e.target.value))))} className="w-20" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handlePrint} className="gap-2"><Printer className="h-4 w-4" /> Imprimir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div ref={printRef} className="hidden">
        {Array.from({ length: copies }, (_, i) => (
          <OSPage key={i} os={os} cliente={cliente} copy={i + 1} total={copies} />
        ))}
      </div>
    </>
  );
}
