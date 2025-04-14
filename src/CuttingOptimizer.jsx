
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CuttingOptimizer() {
  const [rows, setRows] = useState([{ id: 1, length: 0, quantity: 1, color: "" }]);
  const [stockLength, setStockLength] = useState(6500);
  const [results, setResults] = useState([]);
  const [company, setCompany] = useState("");
  const [project, setProject] = useState("");
  const [color, setColor] = useState("");
  const [date, setDate] = useState("");
  const BLADE_WIDTH = 5;

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = field === "length" || field === "quantity" ? Number(value) : value;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    const newId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 1;
    setRows([...rows, { id: newId, length: 0, quantity: 1, color: "" }]);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const handleCalculate = () => {
    let items = [];
    rows.forEach((row) => {
      for (let i = 0; i < row.quantity * 2; i++) {
        items.push({ id: row.id, length: row.length });
      }
    });
    items.sort((a, b) => b.length - a.length);

    let layouts = [];
    let remaining = [...items];
    while (remaining.length) {
      let total = 0;
      let cutList = [];
      let used = [];
      for (let i = 0; i < remaining.length; i++) {
        let space = total === 0 ? stockLength : stockLength - total - BLADE_WIDTH;
        if (remaining[i].length <= space) {
          total += (total === 0 ? 0 : BLADE_WIDTH) + remaining[i].length;
          cutList.push(remaining[i].length);
          used.push(i);
        }
      }
      used.reverse().forEach((index) => remaining.splice(index, 1));
      layouts.push({ cuts: cutList, waste: stockLength - total });
    }
    setResults(layouts);
  };

  const handleExportPDF = () => {
    const input = document.getElementById("results-section");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.text("Optimizimi i Prerjeve", 10, 10);
      pdf.text(`Kompania: ${company}`, 10, 20);
      pdf.text(`Projekti: ${project}`, 10, 30);
      pdf.text(`Ngjyra: ${color}`, 10, 40);
      pdf.text(`Data: ${date}`, 10, 50);
      pdf.addImage(imgData, "PNG", 10, 60, 190, 0);
      pdf.save("optimizimi_prerjeve.pdf");
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Lista e Prerjes</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input placeholder="Emri i Kompanisë" value={company} onChange={(e) => setCompany(e.target.value)} />
        <Input placeholder="Projekti" value={project} onChange={(e) => setProject(e.target.value)} />
        <Input placeholder="Ngjyra" value={color} onChange={(e) => setColor(e.target.value)} />
        <Input placeholder="Data" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">Futja e të dhënave</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Gjatësia (mm)</TableCell>
                  <TableCell>Sasia</TableCell>
                  <TableCell>Ngjyra</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.length}
                        onChange={(e) => handleRowChange(idx, "length", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, "quantity", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.color}
                        onChange={(e) => handleRowChange(idx, "color", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" onClick={() => handleDeleteRow(idx)}>
                        Fshi
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddRow}>Shto rresht</Button>
              <Button className="w-full" onClick={handleCalculate}>
                Llogarit Prerjet
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="font-semibold">Shufrat e disponueshme</h2>
            <Input
              type="number"
              value={stockLength}
              onChange={(e) => setStockLength(Number(e.target.value))}
            />
            <div className="mt-4">
              <h2 className="font-semibold">Parametrat</h2>
              <p>Tehu i prerjes: {BLADE_WIDTH} mm</p>
              <p>Shumëzimi i sasive me 2: Po</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4" id="results-section">
            <h2 className="font-semibold mb-2">Rezultatet</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Shufra #</TableCell>
                  <TableCell>Copat</TableCell>
                  <TableCell>Mbetja (mm)</TableCell>
                  <TableCell>Efikasiteti (%)</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{r.cuts.join(", ")}</TableCell>
                    <TableCell>{r.waste}</TableCell>
                    <TableCell>
                      {((1 - r.waste / stockLength) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="mt-4" onClick={handleExportPDF}>Shkarko si PDF</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
