import { supabase } from './supabase.js'

export async function loadNavbar(){
 const nav=document.getElementById("nav")
 if(!nav) return

 const {data:{user}}=await supabase.auth.getUser()
 if(!user) return

 const {data:p}=await supabase
 .from("users").select("*")
 .eq("email",user.email).single()

 nav.innerHTML=`
 <div class="navbar">
  <img src="logo.png" height="40">
  <div class="nav-links">
   <a href="dashboard.html">Home</a>
   <a href="stats.html">Stats</a>
   <a href="dispatch.html">Dispatch</a>
   <a href="shop.html">Shop</a>
   ${(p.role!='pilot')?'<a href="admin.html">Admin</a>':''}
  </div>
  <div>$${p.balance}</div>
 </div>`
}
