import { useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  const [invNo, setInvNo] = useState("INV-001");
  const [client, setClient] = useState("Ramesh Construction");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { id: 1, desc: "Cement & Material", qty: 10, price: 500 }
  ]);

  const subtotal = items.reduce((a, b) => a + b.qty * b.price, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

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
    doc.text(`Subtotal: Rs.${subtotal}`, 14, y); y+=7;
    doc.text(`GST 18%: Rs.${gst.toFixed(0)}`, 14, y); y+=7;
    doc.text(`TOTAL: Rs.${total.toFixed(0)}`, 14, y);
    doc.save(`${invNo}.pdf`);
  };

  return (
    <div style={{padding:20, maxWidth:900, margin:'auto', fontFamily:'Arial'}}>
      <h1>Invoice Generator</h1>
      <input value={invNo} onChange={e=>setInvNo(e.target.value)} placeholder="Invoice No" style={{padding:8, margin:5}} />
      <input value={client} onChange={e=>setClient(e.target.value)} placeholder="Client" style={{padding:8, margin:5}} />
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:8, margin:5}} />
      <h3>Items</h3>
      {items.map((it,i) => (
        <div key={it.id} style={{display:'flex', gap:5, marginBottom:5}}>
          <input value={it.desc} onChange={e=>{let n=[...items]; n[i].desc=e.target.value; setItems(n)}} style={{flex:2, padding:6}} />
          <input type="number" value={it.qty} onChange={e=>{let n=[...items]; n[i].qty=Number(e.target.value); setItems(n)}} style={{width:70, padding:6}} />
          <input type="number" value={it.price} onChange={e=>{let n=[...items]; n[i].price=Number(e.target.value); setItems(n)}} style={{width:100, padding:6}} />
        </div>
      ))}
      <button onClick={()=>setItems([...items, {id:Date.now(), desc:"", qty:1, price:0}])}>+ Add Item</button>
      <div style={{background:'#eee', padding:15, marginTop:15}}>
        <p>Subtotal: Rs.{subtotal}</p>
        <p>GST 18%: Rs.{gst.toFixed(0)}</p>
        <h2>Total: Rs.{total.toFixed(0)}</h2>
      </div>
      <button onClick={exportPDF} style={{width:'100%', padding:12, background:'#1e3a8a', color:'white', border:'none', borderRadius:8, marginTop:10, cursor:'pointer'}}>Export PDF</button>
    </div>
  );
}