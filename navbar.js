// navbar.js
import { supabase } from './supabase.js'

const navbarContainer = document.getElementById('navbar');

export async function renderNavbar() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // not logged in

  // Get user info from users table
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single();

  const role = userProfile.role;
  const balance = userProfile.balance.toFixed(2);

  // Create navbar
  const nav = document.createElement('div');
  nav.style.display = 'flex';
  nav.style.justifyContent = 'space-between';
  nav.style.alignItems = 'center';
  nav.style.padding = '10px 20px';
  nav.style.background = 'white';
  nav.style.color = '#333';
  nav.style.borderRadius = '10px';
  nav.style.marginBottom = '20px';

  // Logo left
  const logo = document.createElement('img');
  logo.src = 'logo.png';
  logo.style.height = '40px';
  nav.appendChild(logo);

  // Links center
  const links = document.createElement('div');
  links.style.display = 'flex';
  links.style.gap = '15px';

  const pages = [
    { name: 'Dashboard', href: 'dashboard.html' },
    { name: 'Stats', href: 'stats.html' },
    { name: 'Dispatch', href: 'dispatch.html' },
    { name: 'PIREPs', href: 'pirep.html' },
    { name: 'Shop', href: 'shop.html' }
  ];

  pages.forEach(p => {
    const a = document.createElement('a');
    a.href = p.href;
    a.textContent = p.name;
    a.style.textDecoration = 'none';
    a.style.color = '#333';
    a.style.fontWeight = 'bold';
    links.appendChild(a);
  });

  // Admin button only for roles
  const adminRoles = ['CEO','CAO','CMO','CMM','CFI'];
  if (adminRoles.includes(role)) {
    const adminBtn = document.createElement('a');
    adminBtn.href = 'admin.html';
    adminBtn.textContent = 'Admin';
    adminBtn.style.padding = '5px 10px';
    adminBtn.style.borderRadius = '5px';
    adminBtn.style.background = 'linear-gradient(45deg,#106de6,#cd10e6)';
    adminBtn.style.color = 'white';
    adminBtn.style.textDecoration = 'none';
    adminBtn.style.fontWeight = 'bold';
    links.appendChild(adminBtn);
  }

  nav.appendChild(links);

  // Balance right
  const balanceDiv = document.createElement('div');
  balanceDiv.textContent = `$${balance}`;
  balanceDiv.style.fontWeight = 'bold';
  nav.appendChild(balanceDiv);

  navbarContainer.appendChild(nav);
}