import React, { useState } from "react";
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
        <input placeholder="Emri i Kompanisë" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input placeholder="Projekti" value={project} onChange={(e) => setProject(e.target.value)} />
        <input placeholder="Ngjyra" value={color} onChange={(e) => setColor(e.target.value)} />
        <input placeholder="Data" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Futja e të dhënave</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Gjatësia (mm)</th>
                <th>Sasia</th>
                <th>Ngjyra</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.id}</td>
                  <td>
                    <input
                      type="number"
                      value={row.length}
                      onChange={(e) => handleRowChange(idx, "length", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(idx, "quantity", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={row.color}
                      onChange={(e) => handleRowChange(idx, "color", e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleDeleteRow(idx)}>Fshi</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAddRow}>Shto rresht</button>
            <button className="w-full" onClick={handleCalculate}>
              Llogarit Prerjet
            </button>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Shufrat e disponueshme</h2>
          <input
            type="number"
            value={stockLength}
            onChange={(e) => setStockLength(Number(e.target.value))}
          />
          <div className="mt-4">
            <h2 className="font-semibold">Parametrat</h2>
            <p>Tehu i prerjes: {BLADE_WIDTH} mm</p>
            <p>Shumëzimi i sasive me 2: Po</p>
          </div>
        </div>

        <div className="border p-4 rounded" id="results-section">
          <h2 className="font-semibold mb-2">Rezultatet</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Shufra #</th>
                <th>Copat</th>
                <th>Mbetja (mm)</th>
                <th>Efikasiteti (%)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{r.cuts.join(", ")}</td>
                  <td>{r.waste}</td>
                  <td>{((1 - r.waste / stockLength) * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-4" onClick={handleExportPDF}>Shkarko si PDF</button>
        </div>
      </div>
    </div>
  );
}
