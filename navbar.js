import { supabase } from './supabase.js';

async function injectNavbar() {
    try {
        // 1. Get user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (!user || authError) {
            console.log("No user found, redirecting...");
            if (!window.location.pathname.includes('index.html')) {
                window.location.href = 'index.html';
            }
            return;
        }

        // 2. Get Profile
        const { data: profile, error: profError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profError) throw profError;

        // 3. Create Navbar HTML
        const navHTML = `
        <header style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 20px 5%; box-sizing: border-box; position: relative; z-index: 1000;">
            <img src="logo.png" alt="Logo" style="height: 50px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">

            <nav style="background: white; padding: 12px 30px; border-radius: 50px; display: flex; gap: 25px; align-items: center; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                <a href="dashboard.html" style="color: #333; text-decoration: none; font-weight: 700;">Home</a>
                <a href="stats.html" style="color: #333; text-decoration: none; font-weight: 700;">My Stats</a>
                <a href="dispatch.html" style="color: #333; text-decoration: none; font-weight: 700;">Dispatch</a>
                <a href="shop.html" style="color: #333; text-decoration: none; font-weight: 700;">Shop</a>
                ${['CEO', 'CAO', 'CMO', 'CMM', 'CFI'].includes(profile.role) ? 
                    `<a href="admin.html" style="background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); color: white; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);">Admin</a>` 
                    : ''}
            </nav>

            <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 10px 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); font-weight: bold; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                Balance: $${(profile.balance || 0).toLocaleString()}
            </div>
        </header>`;

        document.body.insertAdjacentHTML('afterbegin', navHTML);

    } catch (err) {
        console.error("Navbar Error:", err.message);
    }
}

injectNavbar();
