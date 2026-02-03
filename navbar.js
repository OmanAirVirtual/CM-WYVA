import { supabase } from './supabase.js'

export async function renderNavbar(){
 const nav=document.getElementById("navbar")
 if(!nav) return

 const {data:{user}}=await supabase.auth.getUser()
 if(!user) return

 const {data:profile}=await supabase
 .from("users").select("*")
 .eq("email",user.email).single()

 const adminRoles=["CEO","CAO","CMO","CMM","CFI"]

 nav.innerHTML=`
 <div class="navbar">
   <img src="logo.png" height="40">
   <div class="nav-links">
     <a href="dashboard.html">Home</a>
     <a href="stats.html">Stats</a>
     <a href="dispatch.html">Dispatch</a>
     <a href="shop.html">Shop</a>
     ${adminRoles.includes(profile.role)?'<a class="admin-btn" href="admin.html">Admin</a>':''}
   </div>
   <div>$${profile.balance.toFixed(2)}</div>
 </div>`
}
