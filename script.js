import { supabase } from './supabase.js'
import { renderNavbar } from './navbar.js'

document.addEventListener("DOMContentLoaded", async ()=>{
 await renderNavbar()
 const page=location.pathname.split("/").pop()

 if(page==="admin.html") adminPage()
 if(page==="dispatch.html") dispatchPage()
 if(page==="pirep.html") pirepPage()
 if(page==="shop.html") shopPage()
})

/* ================= ADMIN ================= */

async function adminPage(){
 const legContainer=document.getElementById("legs")

 let legCount=10

 function addLeg(){
  if(legCount>=30) return alert("Max 30 legs")
  legCount++
  renderLeg()
 }

 function renderLeg(){
  const div=document.createElement("div")
  div.className="card"
  div.innerHTML=`
  <input placeholder="Flight No">
  <input placeholder="Route">
  <input placeholder="Distance">
  <input placeholder="Flight Time">
  `
  legContainer.appendChild(div)
 }

 for(let i=0;i<10;i++) renderLeg()

 document.getElementById("addLeg").onclick=addLeg

 document.getElementById("saveSchedule").onclick=async ()=>{
  const email=document.getElementById("pilotEmail").value

  const {data:pilot}=await supabase
  .from("users").select("*").eq("email",email).single()

  if(!pilot) return alert("Pilot not found")

  const cards=[...legContainer.children]
  if(cards.length<10) return alert("Minimum 10 legs")

  let legs=[]

  cards.forEach((c,i)=>{
    const inputs=c.querySelectorAll("input")
    legs.push({
      pilot_id:pilot.id,
      flight_no:inputs[0].value,
      route:inputs[1].value,
      distance:inputs[2].value,
      flight_time:inputs[3].value,
      leg:i+1
    })
  })

  await supabase.from("schedules").insert(legs)
  alert("Schedule saved!")
 }

 loadApprovals()
}

async function loadApprovals(){
 const box=document.getElementById("approvals")
 if(!box) return

 const {data:pireps}=await supabase
 .from("pireps").select("*").eq("approved",false)

 pireps.forEach(p=>{
  const d=document.createElement("div")
  d.className="card"
  d.innerHTML=`
  ${p.flight_no} Leg ${p.leg}
  <button onclick="approvePirep('${p.id}')">Approve</button>`
  box.appendChild(d)
 })
}

window.approvePirep=async id=>{
 const {data:p}=await supabase
 .from("pireps").select("*").eq("id",id).single()

 const salary=(p.flight_time/2)*p.distance

 const {data:user}=await supabase
 .from("users").select("*").eq("id",p.pilot_id).single()

 await supabase.from("users")
 .update({balance:user.balance+salary})
 .eq("id",p.pilot_id)

 await supabase.from("pireps")
 .update({approved:true})
 .eq("id",id)

 alert("Approved & salary added")
}

/* ================= DISPATCH ================= */

async function dispatchPage(){
 const {data:{user}}=await supabase.auth.getUser()
 const {data:profile}=await supabase
 .from("users").select("*")
 .eq("email",user.email).single()

 const {data:s}=await supabase
 .from("schedules")
 .select("*")
 .eq("pilot_id",profile.id)
 .order("leg")

 const box=document.getElementById("schedule")

 let lastDone=true

 s.forEach(f=>{
  const locked=!lastDone

  const d=document.createElement("div")
  d.className="card"
  d.innerHTML=`
  <b>${f.flight_no} ${f.route}</b><br>
  Leg ${f.leg}<br>
  ${f.flight_time}h | ${f.distance}nm<br>
  <button ${locked?'class="disabled"':''}
  onclick="location.href='pirep.html?flight=${f.flight_no}&leg=${f.leg}'">
  File PIREP</button>
  `
  box.appendChild(d)

  lastDone=f.pirep_filed
 })
}

/* ================= PIREP ================= */

async function pirepPage(){
 const params=new URLSearchParams(location.search)
 const flight=params.get("flight")
 const leg=params.get("leg")

 document.getElementById("flight").value=flight
 document.getElementById("leg").value=leg
 document.getElementById("date").value=
 new Date().toISOString().split("T")[0]

 document.getElementById("submitPirep").onclick=async ()=>{
  const {data:{user}}=await supabase.auth.getUser()
  const {data:profile}=await supabase
  .from("users").select("*").eq("email",user.email).single()

  await supabase.from("pireps").insert([{
    pilot_id:profile.id,
    flight_no:flight,
    leg:leg,
    flight_time:document.getElementById("hrs").value,
    distance:document.getElementById("dist").value
  }])

  alert("PIREPs submitted!")
 }
}

/* ================= SHOP ================= */

async function shopPage(){
 const {data:{user}}=await supabase.auth.getUser()
 const {data:profile}=await supabase
 .from("users").select("*").eq("email",user.email).single()

 const ratings=[
 ["Boeing 737 Series",10000],
 ["Embraer E175",8000],
 ["Airbus A330",12000],
 ["B737 MAX",12000],
 ["B787",15000],
 ["B787-10",18000],
 ["A350",20000],
 ["B777-300ER",20000]
 ]

 const box=document.getElementById("shop")

 ratings.forEach(r=>{
  const disabled=profile.balance<r[1]
  const d=document.createElement("div")
  d.className="card"
  d.innerHTML=`
  ${r[0]} - $${r[1]}
  <button ${disabled?'class="disabled"':''}
  onclick="requestType('${r[0]}',${r[1]})">
  Buy</button>`
  box.appendChild(d)
 })
}

window.requestType=async (name,price)=>{
 const {data:{user}}=await supabase.auth.getUser()
 const {data:profile}=await supabase
 .from("users").select("*").eq("email",user.email).single()

 await supabase.from("type_requests")
 .insert([{user_id:profile.id,type_name:name,price}])

 alert("Request sent to admin")
}
