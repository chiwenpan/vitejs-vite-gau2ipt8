import React, { useState, useMemo } from "react";

type Entry = {
  id: string;
  date: string;
  store: string;
  sales: number;
  tail: number;
  refund: number;
  productBonus: number;
};

const stores = [
  "AA","AD","A1","A2","A3","A5","A6","A7","A8",
  "A9","A10","A11","A12","A13","A15"
];

function calcCommission(net:number){
  if(net <= 100000) return net * 0.02
  if(net <= 200000) return net * 0.03
  if(net <= 300000) return net * 0.045
  return net * 0.05
}

function App(){

const [entries,setEntries] = useState<Entry[]>([])
const [year,setYear] = useState(2026)
const [month,setMonth] = useState(2)

const [selectedDate,setSelectedDate] = useState("2026-03-01")
const [showForm,setShowForm] = useState(false)

const [form,setForm] = useState({
store:"AA",
sales:"",
tail:"",
refund:"",
productBonus:""
})

function saveEntry(){

const newEntry:Entry={
id:crypto.randomUUID(),
date:selectedDate,
store:form.store,
sales:Number(form.sales||0),
tail:Number(form.tail||0),
refund:Number(form.refund||0),
productBonus:Number(form.productBonus||0)
}

setEntries([...entries,newEntry])
setShowForm(false)

}

const days = Array.from({length:31},(_,i)=>i+1)

function getDayEntries(day:number){

const d = `${year}-03-${String(day).padStart(2,"0")}`

return entries.filter(e=>e.date===d)

}

return(

<div style={{padding:20,fontFamily:"Microsoft JhengHei"}}>

<h2>私人薪資月曆</h2>

<button onClick={()=>setShowForm(true)}>新增資料</button>

<div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginTop:20}}>

{days.map(day=>{

const list = getDayEntries(day)

let salary = 0

list.forEach(e=>{
const net = e.sales + e.tail - e.refund
salary += calcCommission(net) + e.productBonus
})

return(

<div
key={day}
onClick={()=>setSelectedDate(`2026-03-${String(day).padStart(2,"0")}`)}
style={{
border:"1px solid #ccc",
borderRadius:12,
padding:10,
minHeight:120
}}
>

<div>{day}</div>

{list.map(e=>(

<div key={e.id}>

<div>{e.store}</div>
<div>{e.sales.toLocaleString()}</div>

</div>

))}

<div style={{color:"green",fontWeight:600}}>
薪水 {salary.toLocaleString()}
</div>

</div>

)

})}

</div>

{showForm && (

<div style={{
position:"fixed",
top:0,
left:0,
right:0,
bottom:0,
background:"rgba(0,0,0,0.5)",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}>

<div style={{background:"#fff",padding:20,borderRadius:10,width:300}}>

<h3>{selectedDate}</h3>

<select
value={form.store}
onChange={e=>setForm({...form,store:e.target.value})}
>

{stores.map(s=>(

<option key={s}>{s}</option>

))}

</select>

<input
placeholder="業績"
value={form.sales}
onChange={e=>setForm({...form,sales:e.target.value})}
/>

<input
placeholder="尾款"
value={form.tail}
onChange={e=>setForm({...form,tail:e.target.value})}
/>

<input
placeholder="退款"
value={form.refund}
onChange={e=>setForm({...form,refund:e.target.value})}
/>

<input
placeholder="產品獎金"
value={form.productBonus}
onChange={e=>setForm({...form,productBonus:e.target.value})}
/>

<button onClick={saveEntry}>儲存</button>

</div>

</div>

)}

</div>

)

}

export default App
