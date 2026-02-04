import { supabase } from './supabase.js';

const btnAuth = document.getElementById('btnAuth');

btnAuth.onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const callsign = document.getElementById('callsign').value;
    const name = document.getElementById('fullname').value;
    const aircraft = document.getElementById('aircraft').value;

    // 1. Auth Sign Up
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (data.user) {
        // 2. Create Profile row
        await supabase.from('profiles').insert([
            { 
                id: data.user.id, 
                callsign: callsign, 
                name: name, 
                aircraft_family: aircraft, 
                balance: 0, 
                role: 'Pilot' 
            }
        ]);
        window.location.href = 'dashboard.html';
    } else {
        // If user exists, try Login
        const { error: logErr } = await supabase.auth.signInWithPassword({ email, password });
        if (!logErr) window.location.href = 'dashboard.html';
        else alert(logErr.message);
    }
};
