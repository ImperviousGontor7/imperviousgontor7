/* ============================================================
   I. KONSTANTA & DATA (DATES)
   ============================================================ */
   const DATES = {
    yudisium: new Date("February 19, 2027 07:00:00").getTime(),
    ka: new Date("April 19, 2026 07:00:00").getTime(),
    pg: new Date("May 3, 2026 20:00:00").getTime()
};

/* ============================================================
   II. CORE ENGINE (Booting System)
   ============================================================ */
   
   function bootCinemaOS() {
    setTimeout(() => document.body.classList.add('loaded'), 750);
    initCursor();
    initTimers();
    initScrollEffects();
    initInteractiveCanvas();
    init3DTilt();
    initObserver();
    initContextMenu();

    renderFullUI(); // 🔥 TAMBAH DI SINI
    updateXP();        // 🔥 XP jalan

    setTimeout(() => {
            smoothScrollTo(window.innerHeight * 0.75, 1000);
    }, 3000);
}

/* ============================================================
   III. LOGIKA TIMER (Countdown Logic)
   ============================================================ */
function initTimers() {
    const compute = () => {
        const now = new Date().getTime();
        updateTime('y', DATES.yudisium - now);
        updateTime('ka', DATES.ka - now);
        updateTime('pg', DATES.pg - now);
    };
    setInterval(compute, 1000); 
    compute();
}

function updateTime(px, diff) {
    const safe = Math.max(0, diff);
    const d = Math.floor(safe / 86400000), 
          h = Math.floor((safe % 86400000) / 3600000);
    const m = Math.floor((safe % 3600000) / 60000), 
          s = Math.floor((safe % 60000) / 1000);
          
    renderDOM(`${px}-d`, px === 'y' ? d : (d < 10 ? '0' + d : d));
    renderDOM(`${px}-h`, h < 10 ? '0' + h : h); 
    renderDOM(`${px}-m`, m < 10 ? '0' + m : m); 
    renderDOM(`${px}-s`, s < 10 ? '0' + s : s);
}

function renderDOM(id, val) { 
    const el = document.getElementById(id); 
    if(el && el.innerText !== String(val)) el.innerText = val; 
}

/* ============================================================
   IV. ROUTING & NAVIGATION (View Switching)
   ============================================================ */
function switchView(id, btn) {
    document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
    btn.classList.add('active');
    const current = document.querySelector('.view-pane.active');
    const target = document.getElementById('view-' + id);
    
    if(current && target && current !== target) {
        current.style.opacity = '0'; 
        current.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            current.classList.remove('active'); 
            current.style = '';
            target.classList.add('active');
            smoothScrollTo(document.getElementById('glass-nav').offsetTop - 20, 800);
        }, 400);
    }
}

function smoothScrollTo(target, duration) {
    const start = window.pageYOffset, dist = target - start; 
    let startT = null;
    const step = (currT) => {
        if(!startT) startT = currT;
        const p = Math.min((currT - startT) / duration, 1);
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        window.scrollTo(0, start + dist * ease);
        if(p < 1) requestAnimationFrame(step);
    }; 
    requestAnimationFrame(step);
}

/* ============================================================
   V. INTERACTIVE VISUALS (Canvas & Particles)
   ============================================================ */
function initInteractiveCanvas() {
    const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
let w, h;

// resize canvas
function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// class partikel
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;

        // arah gerak (naik pelan + random)
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * -0.8 - 0.2;

        this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // kalau keluar layar → muncul lagi bawah
        if (this.y < 0) {
            this.y = h;
            this.x = Math.random() * w;
        }

        if (this.x > w) this.x = 0;
        if (this.x < 0) this.x = w;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(210,180,140,${this.opacity})`; // warna coklat emas
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// buat banyak partikel
for (let i = 0; i < 120; i++) {
    particles.push(new Particle());
}

// animasi loop
function animateParticles() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();
}

/* ============================================================
   VI. UI EXTRAS (Cursor, Tilt, Context Menu, Scroll)
   ============================================================ */
function initCursor() {
    const dot = document.getElementById('c-dot'), ring = document.getElementById('c-ring');
    if(!dot || !ring) return;
    let mx = window.innerWidth/2, my = window.innerHeight/2, rx = mx, ry = my;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx+'px'; dot.style.top = my+'px'; });
    const renderRing = () => { rx += (mx - rx)*0.2; ry += (my - ry)*0.2; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(renderRing); };
    renderRing();
    document.querySelectorAll('a, button, .hover-target').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

function init3DTilt() {
    const card = document.getElementById('engine-sidebar');
    if(!card) return;
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
        const rx = ((y - rect.height/2) / (rect.height/2)) * -8, ry = ((x - rect.width/2) / (rect.width/2)) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`);
}

function initContextMenu() {
    const menu = document.getElementById('context-menu');
    if(!menu) return;
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        menu.style.display = 'block'; menu.style.left = e.pageX + 'px'; menu.style.top = e.pageY + 'px';
    });
    document.addEventListener('click', () => menu.style.display = 'none');
}

function initScrollEffects() {
    const bar = document.getElementById('scroll-progress');
    const btn = document.getElementById('back-top');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const ws = document.documentElement.scrollTop || document.body.scrollTop;
                const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                
                if(bar) bar.style.width = (ws / h) * 100 + "%";
                if(btn) ws > 500 ? btn.classList.add('visible') : btn.classList.remove('visible');
                
                ticking = false;
            });
            ticking = true;
        }
    });
}
function initObserver() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-scroll').forEach(el => obs.observe(el));
}

/* ============================================================
   VII. FIREBASE & MESSAGING LOGIC
   ============================================================ */
// Ganti data di bawah ini dengan data dari Project Settings Firebase kamu
const firebaseConfig = {
    authDomain: "project-kamu.firebaseapp.com",
    databaseURL: "https://project-kamu-default-rtdb.firebaseio.com",
    projectId: "project-kamu",
    storageBucket: "project-kamu.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:12345:web:abcde"
};

// Inisialisasi Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = (typeof firebase !== 'undefined') ? firebase.database() : null;

function sendMessage() {
    const input = document.getElementById('user-input');
    if (input && input.value.trim() !== "" && database) {
        // Simpan ke Database Firebase
        const newMessageRef = database.ref('messages').push();
        newMessageRef.set({
            text: input.value,
            timestamp: Date.now(),
            sender: "User-" + Math.floor(Math.random() * 1000) 
        });
        input.value = "";
    }
}

// Mendengarkan pesan dari database
if(database) {
    database.ref('messages').on('child_added', (snapshot) => {
        const data = snapshot.val();
        const container = document.getElementById('chat-container');
        if (!container) return;

        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            align-self: flex-start;
            background: var(--border-glass);
            color: white;
            padding: 10px 15px;
            border-radius: 15px;
            max-width: 80%;
            margin-bottom: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            animation: slideIn 0.3s ease;
        `;
        
        msgDiv.innerHTML = `
            <small style="color:var(--antiquewhite); display:block; font-size:0.7rem; margin-bottom:3px;">${data.sender}</small>
            <span>${data.text}</span>
        `;
        
        container.appendChild(msgDiv);

        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    });
}

// Event listener untuk tombol Enter
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && document.activeElement.id === 'user-input') {
        sendMessage();
    }
});

/* ============================================================
   VIII. THEME TOGGLE
   ============================================================ */
   function toggleTheme() {
    const doc = document.documentElement;
    const img = document.querySelector('.logo-hologram-1');

    if (doc.getAttribute('data-theme') === 'dark') {
        doc.setAttribute('data-theme', 'light');
        img.src = 'Logo Hologram Coklat Khat Marhalah.png';
    } else {
        doc.setAttribute('data-theme', 'dark');
        img.src = 'Logo Hologram Putih Khat Marhalah.png';
    }
}

/* ============================================================
   IX. XP SYSTEM
   ============================================================ */

   function updateXP() {
    const percent = (player.XP / player.maxXP) * 100;

    const fill = document.getElementById('eXP-bar');
    const text = document.getElementById('eXP-val');

    if (fill && text) {
        fill.style.width = percent + '%';
        text.innerText = `${player.XP} / ${player.maxXP} (${percent.toFixed(1)}%)`;
    }
}

/* ============================================================
   player SYSTEM (CUSTOM)
   ============================================================ */

const player = {
    XP: 0,
    maxXP: 150,
    HP: 100,
    maxHP: 100,
    MP: 100,
    maxMP: 100,
    level: 1,
    maxLevel: 6101,

    job: "Impervious",

    progress: 40,

    stats: {
    // ⚔️ BASIC STATS
    STRENGTH: 10,        // serangan fisik
    VITALITY: 10,        // HP / ketahanan
    AGILITY: 10,         // kecepatan / dodge
    INTELLIGENCE: 10,    // magic power
    PERCEPTION: 10,      // akurasi / detect

    // 🔥 ADVANCED STATS (anime style)
    DEXTERITY: 10,       // critical / finesse
    LUCK: 10,            // RNG / drop / crit rate
    ENDURANCE: 10,       // stamina / tahan lama
    CHARISMA: 10,        // influence / leadership
    WISDOM: 10,          // control magic / decision

    // 🛡 DEFENSE STATS
    EVASION: 5,          // dodge chance

    // 🔮 SPECIAL (anime vibes)
    AURA: 10,            // tekanan aura (kayak MC OP 😎)
    FATE: 1,             // keberuntungan takdir
    INSTINCT: 10         // refleks alami
},

    skills: [
        { name: "Al-Qur'an", level: 1 },
        { name: "Muthola'ah", level: 1 },
        { name: "Tamrin Lugoh", level: 1 },
        { name: "Nahwu", level: 1 },
        { name: "Shorof", level: 1 },
        { name: "Mahfudzot", level: 1 },
        { name: "Tarbiyah", level: 1 },
    ],

    equipment: [
        // 🔴 SS (Legendary / God Tier)
    
        // 🟡 S (Epic)
    
        // 🟣 A (Rare)
    
        // 🔵 B (Uncommon)
    
        // ⚪ C (Common)
        { name: "Dasi", rarity: "C" },
        { name: "Co-Card PBS", rarity: "C" },

        // ⚫ D (Low)
        { name: "Jas Berkancing Lepas", rarity: "D" },
        { name: "Kemeja Putih Kuningan", rarity: "D" },
    
        // ⚫ E (Very Low)

    ]

}

/* ============================================================
   X. PROGRESS SYSTEM
   ============================================================ */

   function addXP(amount){
    if (!player.XP) player.XP = 0;

    player.XP += amount;

    console.log("XP:", player.XP, "/", player.maxXP);

    // 🔥 multi level support
    while (player.XP >= player.maxXP) {
        player.XP -= player.maxXP;
        levelUp(); // efek langsung dari sini
    }

    updateXP();
}

function levelUp() {
    player.level = (player.level || 1) + 1;

    if (player.level % 20 === 0) {
        player.skills.forEach(skill => {
            skill.level += 1;
        });
    }

    // 🔥 scaling
    player.maxXP = Math.floor(player.maxXP * 1.01);
    player.maxHP = Math.floor(player.maxHP * 1.015);
    player.maxMP = Math.floor(player.maxMP * 1.025);

    player.stats.STRENGTH += Math.floor(player.level * 0.5);
    player.stats.VITALITY += Math.floor(player.level * 0.4);
    player.stats.AGILITY += Math.floor(player.level * 0.2);
    player.stats.INTELLIGENCE += Math.floor(player.level * 0.25);
    player.stats.PERCEPTION += Math.floor(player.level * 0.15);
    player.stats.DEXTERITY += Math.floor(player.level * 0.5);
    player.stats.LUCK += Math.floor(player.level * 0.4);
    player.stats.ENDURANCE += Math.floor(player.level * 0.2);
    player.stats.CHARISMA += Math.floor(player.level * 0.25);
    player.stats.WISDOM += Math.floor(player.level * 0.15);
    player.stats.EVASION += Math.floor(player.level * 0.15);
    player.stats.AURA += Math.floor(player.level * 0.15);
    player.stats.FATE += Math.floor(player.level * 0.15);
    player.stats.INSTINCT += Math.floor(player.level * 0.15);
    

    if (player.job === "Warrior") {
        player.stats.STRENGTH += +3;
    }

    // 🔥 RANDOM STAT (INI YANG LU MAU)
    const stats = Object.keys(player.stats);
    const randomStat = stats[Math.floor(Math.random() * stats.length)];

    player.stats[randomStat] += 3;

    console.log("Naik stat:", randomStat);

    // refill
    player.HP = player.maxHP;
    player.MP = player.maxMP;

    console.log(`LEVEL UP 🔥 Lv: ${player.level}`);

    // 🔥 efek CSS (glow / animasi body)
    document.body.classList.add("level-up");
    setTimeout(() => {
        document.body.classList.remove("level-up");
    }, 600);

    if (player.level % 100 === 0) {
        changeJob();
    }

    // 🔥 flash putih (overlay)
    const flash = document.getElementById("levelup-flash");
    if (flash) {
        flash.style.opacity = "1";
        setTimeout(() => {
            flash.style.opacity = "0";
        }, 150);

        if (player.level % 100 === 0) {
            changeJob();
        }
    }

    // 🔥 update semua UI
    updateXP();
    renderFullUI();
}

let tick = 0;

setInterval(() => {
    tick++;

    // XP tiap 3 detik
    if (tick % 3 === 0) {
        addXP(50);
    }

}, 1100);

function flashLevelUp() {
    const flash = document.getElementById("levelup-flash");
    if (!flash) return;

    flash.style.opacity = "1";

    setTimeout(() => {
        flash.style.opacity = "0";
    }, 150);
}

function renderFullUI() {

    // HP
    const HPVal = document.getElementById("HP-val");
    const HPBar = document.getElementById("HP-bar");
    if(HPVal && HPBar){
        HPVal.innerText = `${player.HP} / ${player.maxHP}`;
        HPBar.style.width = (player.HP / player.maxHP * 100) + "%";
    }

    // MP
    const MPVal = document.getElementById("MP-val");
    const MPBar = document.getElementById("MP-bar");
    if(MPVal && MPBar){
        MPVal.innerText = `${player.MP} / ${player.maxMP}`;
        MPBar.style.width = (player.MP / player.maxMP * 100) + "%";
    }

    // LEVEL
    const levelVal = document.getElementById("level-val");
    if(levelVal){
        levelVal.innerText = player.level;
    }

    const jobVal = document.getElementById("job-val");
    if (jobVal) {
        jobVal.innerText = player.job;
    }

    // ATTRIBUTES
    const attrBox = document.getElementById("attr-box");
    if(attrBox){
        attrBox.innerHTML = Object.entries(player.stats)
        .map(([k,v]) => `
            <div class="stat-row">
                <span>${k}</span>
                <b>${v}</b>
            </div>
        `)
        .join("");
    }

    // SKILLS
    const skillBox = document.getElementById("skill-box");
    if(skillBox){
        skillBox.innerHTML = player.skills
        .map(s => `
        <div class="skill-item">
            <span class="left">⚔ ${s.name}</span>
            <span class="right">Lv.${s.level}</span>
        </div>
    `)
    }

    // EQUIPMENT
    const equipBox = document.getElementById("equip-box");
    if(equipBox){
        equipBox.innerHTML = player.equipment
        .map(e => `
        <div class="equip-item rarity-${e.rarity}">
            <span class="left">🛡 ${e.name}</span>
            <span class="right">[${e.rarity}]</span>
        </div>
    `)
    }
}

// 4. CALLER
window.addEventListener("DOMContentLoaded", bootCinemaOS);
console.log("BOOTING...");

function renderImages() {
    const images = [
        "assets/img/1.jpg",
        "assets/img/2.jpg",
        "assets/img/3.jpg",
        "assets/img/4.jpg",
        "assets/img/5.jpg",
        "assets/img/6.jpg"
    ];

    const grid = document.getElementById("ig-grid");
    if(!grid) return;

    // reset biar gak dobel kalau dipanggil ulang
    grid.innerHTML = "";

    for (let i = 1; i <= images.length; i++) {
        const img = document.createElement("img");
        img.src = `assets/img/${i}.jpg`;
        img.loading = "lazy"; // biar ringan

        // optional klik
        img.addEventListener("click", () => {
            window.open(img.src, "_blank");
        });

        grid.appendChild(img);
    };
}
    
    function changeJob() {
        const jobs = [
            "Impervious",
            "Peasant",
            "Farmer",
            "Servant",
            "Village Guard",
            "Squire",
            "Footman",
            "Scout",
            "Archer",
            "Infantry",
            "Royal Guard",
            "Knight",
            "Senior Knight",
            "Elite Knight",
            "Paladin",
            "Royal Paladin",
            "Champion",
            "Warlord",
            "Battle Master",
            "Commander",
            "High Commander",
            "General",
            "High General",
            "War Strategist",
            "Royal Strategist",
            "Tactician",
            "Master Tactician",
            "Castle Keeper",
            "Fortress Guardian",
            "Royal Sentinel",
            "Court Officer",
            "Royal Advisor",
            "High Advisor",
            "Minister",
            "High Minister",
            "Chancellor",
            "Grand Chancellor",
            "Archon",
            "Noble",
            "High Noble",
            "Baron",
            "Viscount",
            "Count",
            "Marquis",
            "Duke",
            "Grand Duke",
            "Prince",
            "Crown Prince",
            "King",
            "High King",
            "Emperor",
            "High Emperor",
            "Supreme Emperor",
            "Divine Ruler",
            "Celestial King",
            "Mythic Sovereign",
            "Immortal Monarch",
            "God-King",
            "Eternal God-King"
        ];
    
        const index = Math.floor(player.level / 100);
    
        if (index < jobs.length) {
            player.job = jobs[index];
        } else {
            player.job = "Transcendent"; // kalau udah lewat list
        }
    
        console.log("JOB CHANGE 🔥:", player.job);
    
        renderFullUI();
    }