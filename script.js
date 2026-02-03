// script.js
import { supabase } from './supabase.js';
import { renderNavbar } from './navbar.js';

document.addEventListener('DOMContentLoaded', async () => {
  await renderNavbar();

  // Detect page
  const path = window.location.pathname.split('/').pop();

  if (path === 'index.html' || path === '') setupLoginPage();
  if (path === 'dashboard.html') loadDashboard();
  if (path === 'stats.html') loadStats();
  if (path === 'dispatch.html') loadDispatch();
  if (path === 'pirep.html') loadPirepForm();
  if (path === 'shop.html') loadShop();
  if (path === 'admin.html') loadAdmin();
});

/* ---------------- LOGIN & REGISTER ---------------- */
function setupLoginPage() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  loginBtn?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    window.location.href = 'dashboard.html';
  });

  registerBtn?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('regPassword').value;
    const callsign = document.getElementById('callsign').value;
    const name = document.getElementById('name').value;
    const cm_type = document.getElementById('cm_type').value;
    const aircraft = document.getElementById('aircraft').value;

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return alert(authError.message);

    const { error } = await supabase.from('users').insert([{ email, callsign, name, cm_type, aircraft, role: 'Pilot', balance: 0 }]);
    if (error) return alert(error.message);

    alert('Registration successful!');
    window.location.href = 'dashboard.html';
  });
}

/* ---------------- DASHBOARD ---------------- */
async function loadDashboard() {
  const { data: pilots } = await supabase.from('users').select('*');
  const { data: flights } = await supabase.from('pireps').select('*');
  const totalDistance = flights?.reduce((sum,f) => sum+parseFloat(f.distance||0),0) || 0;

  document.getElementById('totalPilots').textContent = pilots.length;
  document.getElementById('totalFlights').textContent = flights.length;
  document.getElementById('totalDistance').textContent = totalDistance.toFixed(2);
}

/* ---------------- STATS ---------------- */
async function loadStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert('Please login');

  const { data: profile } = await supabase.from('users').select('*').eq('email', user.email).single();
  const { data: flights } = await supabase.from('pireps').select('*').eq('pilot_id', profile.id);

  document.getElementById('myBalance').textContent = profile.balance.toFixed(2);
  document.getElementById('activeAircraft').textContent = profile.aircraft;
  document.getElementById('myFlights').textContent = flights.length;
}

/* ---------------- DISPATCH ---------------- */
async function loadDispatch() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert('Please login');
  const { data: profile } = await supabase.from('users').select('*').eq('email', user.email).single();
  const { data: schedule } = await supabase.from('schedules').select('*').eq('pilot_id', profile.id);

  const container = document.getElementById('scheduleContainer');
  container.innerHTML = '';

  schedule.forEach(flight => {
    const div = document.createElement('div');
    div.style.border = '1px solid white';
    div.style.padding = '10px';
    div.style.margin = '10px 0';
    div.style.borderRadius = '10px';
    div.innerHTML = `
      <h3>${flight.flight_no} - ${flight.route}</h3>
      <p>Leg: ${flight.leg} | Flight Time: ${flight.flight_time}h | Distance: ${flight.distance} km</p>
      <button ${flight.dispatched ? '' : 'disabled'} class="dispatchBtn">Dispatch</button>
      <button ${flight.dispatched ? '' : 'disabled'} class="pirepBtn">File PIREP</button>
    `;
    container.appendChild(div);
  });
}

/* ---------------- PIREP ---------------- */
async function loadPirepForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const flightNo = urlParams.get('flightNo');
  const leg = urlParams.get('leg');

  document.getElementById('flightNo').value = flightNo;
  document.getElementById('leg').value = leg;
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  document.getElementById('pirepForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('*').eq('email', user.email).single();

    const values = {
      pilot_id: profile.id,
      flight_no: flightNo,
      leg: parseInt(leg),
      date: new Date().toISOString(),
      flight_time: parseFloat(document.getElementById('flightTime').value),
      flight_time_mins: parseInt(document.getElementById('flightTimeMins').value),
      fuel_used: parseFloat(document.getElementById('fuelUsed').value),
      passengers: parseInt(document.getElementById('passengers').value),
      distance: parseFloat(document.getElementById('distance').value),
      remarks: document.getElementById('remarks').value,
      approved: false
    };

    await supabase.from('pireps').insert([values]);
    alert('PIREPs submitted!');
    window.location.href = 'dashboard.html';
  });
}

/* ---------------- SHOP ---------------- */
async function loadShop() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from('users').select('*').eq('email', user.email).single();
  const { data: ratings } = await supabase.from('type_ratings').select('*');

  const container = document.getElementById('typeShopContainer');
  container.innerHTML = '';

  ratings.forEach(r => {
    const div = document.createElement('div');
    div.style.border = '1px solid white';
    div.style.padding = '10px';
    div.style.margin = '10px 0';
    div.style.borderRadius = '10px';
    const disabled = profile.balance < r.price ? 'disabled' : '';
    div.innerHTML = `
      <p>${r.name} — $${r.price}</p>
      <button ${disabled} data-id="${r.id}">Buy This Type Rating</button>
    `;
    container.appendChild(div);

    div.querySelector('button').addEventListener('click', async () => {
      await supabase.from('type_ratings').update({ requested_by: profile.id }).eq('id', r.id);
      alert('Request sent to admin!');
    });
  });
}

/* ---------------- ADMIN ---------------- */
async function loadAdmin() {
  // Only show for admin roles
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from('users').select('*').eq('email', user.email).single();
  const adminRoles = ['CEO','CAO','CMO','CMM','CFI'];
  if (!adminRoles.includes(profile.role)) return alert('Access denied');

  // TODO: Implement schedule maker, stats graph, type rating approvals
}