import { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

function parseInvoiceRequest(text) {
  const amountMatch = text.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  const clientMatch = text.match(
    /\bfor\s+(.+?)(?=\s+(?:rs\.?|inr|₹)\s*[\d,]|\s+with\s+\d+(?:\.\d+)?\s*%|$)/i
  );
  const gstMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:gst|tax)?/i);

  if (!amountMatch || !clientMatch) return null;

  const amount = Number(amountMatch[1].replaceAll(",", ""));
  const gstRate = gstMatch ? Number(gstMatch[1]) : 18;
  const client = clientMatch[1].trim().replace(/[,.!?]+$/, "");

  if (!client || !Number.isFinite(amount) || amount <= 0 || gstRate < 0 || gstRate > 100) {
    return null;
  }

  return { client, amount, gstRate };
}

export default function App() {
  const [invNo, setInvNo] = useState("INV-001");
  const [client, setClient] = useState("Ramesh Construction");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gstRate, setGstRate] = useState(18);
  const [request, setRequest] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [items, setItems] = useState([
    { id: 1, desc: "Cement & Material", qty: 10, price: 500 }
  ]);

  const subtotal = items.reduce((a, b) => a + b.qty * b.price, 0);
  const gst = subtotal * (gstRate / 100);
  const total = subtotal + gst;

  const createFromRequest = (event) => {
    event.preventDefault();
    const parsedRequest = parseInvoiceRequest(request);

    if (!parsedRequest) {
      setRequestMessage("Enter a client and amount, such as: Create invoice for Viji company Rs 5000 with 18% GST");
      return;
    }

    setClient(parsedRequest.client);
    setGstRate(parsedRequest.gstRate);
    setItems([{ id: Date.now(), desc: "Services", qty: 1, price: parsedRequest.amount }]);
    setRequestMessage(`Draft created for ${parsedRequest.client}. Review it before exporting.`);
  };

  const updateItem = (id, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("INVOICE", 80, 20);
    doc.setFontSize(11);
    doc.text(`Invoice No: ${invNo}`, 14, 35);
    doc.text(`Date: ${date}`, 14, 42);
    doc.text(`Client: ${client}`, 14, 49);
    let y = 65;
    doc.text("Description | Qty | Price | Amount", 14, y);
    y += 8;
    items.forEach(it => {
      doc.text(`${it.desc} | ${it.qty} | ${it.price} | ${it.qty * it.price}`, 14, y);
      y += 7;
    });
    y += 5;
    doc.text(`Subtotal: Rs.${subtotal.toFixed(2)}`, 14, y); y += 7;
    doc.text(`GST ${gstRate}%: Rs.${gst.toFixed(2)}`, 14, y); y += 7;
    doc.text(`TOTAL: Rs.${total.toFixed(2)}`, 14, y);
    doc.save(`${invNo}.pdf`);
  };

  return (
    <main className="invoice-container">
      <h1>Invoice Generator</h1>

      <section className="invoice-assistant" aria-labelledby="assistant-title">
        <h2 id="assistant-title">Create from a description</h2>
        <form className="request-form" onSubmit={createFromRequest}>
          <label className="visually-hidden" htmlFor="invoice-request">Invoice details</label>
          <input
            id="invoice-request"
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="Create invoice for Viji company Rs 5000 with 18% GST"
          />
          <button type="submit">Create draft</button>
        </form>
        {requestMessage && <p className="request-message" role="status">{requestMessage}</p>}
      </section>

      <section className="invoice-header" aria-label="Invoice details">
        <div className="form-group">
          <label htmlFor="invoice-number">Invoice number</label>
          <input id="invoice-number" value={invNo} onChange={(event) => setInvNo(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="invoice-client">Client</label>
          <input id="invoice-client" value={client} onChange={(event) => setClient(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="invoice-date">Date</label>
          <input id="invoice-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
      </section>

      <section className="items-section" aria-labelledby="items-title">
        <div className="section-heading">
          <h2 id="items-title">Items</h2>
          <button type="button" onClick={() => setItems([...items, { id: Date.now(), desc: "", qty: 1, price: 0 }])}>
            + Add item
          </button>
        </div>
        <div className="table-scroll">
          <table className="items-table">
            <thead>
              <tr><th>Description</th><th>Qty</th><th>Price (Rs.)</th><th>Amount</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><input aria-label="Description" value={item.desc} onChange={(event) => updateItem(item.id, "desc", event.target.value)} /></td>
                  <td><input aria-label="Quantity" type="number" min="0" value={item.qty} onChange={(event) => updateItem(item.id, "qty", Number(event.target.value))} /></td>
                  <td><input aria-label="Price" type="number" min="0" step="0.01" value={item.price} onChange={(event) => updateItem(item.id, "price", Number(event.target.value))} /></td>
                  <td>Rs.{(item.qty * item.price).toFixed(2)}</td>
                  <td><button className="remove-btn" type="button" aria-label={`Remove ${item.desc || "item"}`} onClick={() => setItems(items.filter((current) => current.id !== item.id))}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="totals-section" aria-label="Invoice totals">
        <div className="total-row"><span>Subtotal</span><span>Rs.{subtotal.toFixed(2)}</span></div>
        <div className="total-row"><span>GST ({gstRate}%)</span><span>Rs.{gst.toFixed(2)}</span></div>
        <div className="total-row grand-total"><span>Total</span><span>Rs.{total.toFixed(2)}</span></div>
      </section>

      <button className="export-btn" type="button" onClick={exportPDF}>Export PDF</button>
    </main>
  );
}