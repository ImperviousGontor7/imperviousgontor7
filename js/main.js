/* ============================================================
   I. KONSTANTA & DATA (DATES)
   ============================================================ */
   const DATES = {
    yudisium: new Date("February 19, 2027 07:00:00").getTime(),
    ka: new Date("May 14, 2026 07:00:00").getTime(),
    pg: new Date("May 2, 2026 20:00:00").getTime()
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
    initObserver();
    initContextMenu();

    setTimeout(() => {
        document.body.classList.add('loaded');
      
        // ✅ Paksa mulai dari paling atas
        window.scrollTo(0, 0);
      
        // ⏱️ Delay 2.5 detik setelah shutter buka
        setTimeout(() => {
      
          let scrollTarget;
      
          if (window.innerWidth <= 500) {
            scrollTarget = window.innerHeight * 0.9;
          } else if (window.innerWidth <= 768) {
            scrollTarget = window.innerHeight * 0.8;
          } else {
            scrollTarget = window.innerHeight * 0.75;
          }
      
          if (window.innerWidth > 768 && window.scrollY < 50) {
            window.scrollTo({
                top: scrollTarget,
                behavior: "smooth"
            });
        }
      
        }, 2000);
      
      }, 1500);
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
    const target = document.getElementById('view-' + id);
    const current = document.querySelector('.view-pane.active');

    if (!target) return;

    // reset active menu
    document.querySelectorAll('.nav-menu a')
        .forEach(a => a.classList.remove('active'));

    btn.classList.add('active');

    // hapus active lama (kalau ada)
    if (current) {
        current.classList.remove('active');
    }

    // tampilkan target
    target.classList.add('active');
}

// ===== MOBILE MENU =====
document.addEventListener("DOMContentLoaded", () => {

    const overlay = document.getElementById("overlay");
    const menuBtn = document.getElementById("menuBtn");
    const mobileSidebar = document.getElementById("mobileSidebar");

    // TOGGLE MENU
    function toggleMenu() {
        menuBtn.classList.toggle("active");
        mobileSidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    }

    // Biar bisa dipanggil dari HTML (onclick)
    window.toggleMenu = toggleMenu;

    // AUTO CLOSE saat klik menu
    document.querySelectorAll('.mobile-sidebar a').forEach(link => {
        link.addEventListener('click', () => {
            mobileSidebar.classList.remove("active");
            menuBtn.classList.remove("active");
            overlay.classList.remove("active");
        });
    });

    // CLOSE saat klik overlay
    overlay.addEventListener("click", () => {
        mobileSidebar.classList.remove("active");
        menuBtn.classList.remove("active");
        overlay.classList.remove("active");
    });

});

function initInteractiveCanvas() {
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");

    let particles = [];
    let w, h;
    let lastTime = 0;
    let animId; // ✅ penting

    // =========================
    // RESIZE CANVAS
    // =========================
    function resizeCanvas() {
        const scale = 0.5;

        w = canvas.width = window.innerWidth * scale;
        h = canvas.height = window.innerHeight * scale;

        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
        ctx.scale(scale, scale);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // =========================
    // PARTICLE CLASS
    // =========================
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 0.5;

            this.speedX = Math.random() * 0.6 - 0.3;
            this.speedY = Math.random() * -0.8 - 0.2;

            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.y < 0) {
                this.y = h;
                this.x = Math.random() * w;
            }

            if (this.x > w) this.x = 0;
            if (this.x < 0) this.x = w;
        }

        draw() {
            ctx.beginPath();
            ctx.fillStyle = `rgba(210,180,140,${this.opacity})`;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // =========================
    // INIT PARTICLES
    // =========================
    let particleCount = window.innerWidth > 1200 ? 40 : 25;

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // =========================
    // ANIMATION LOOP (30 FPS)
    // =========================
    function animateParticles(time) {
        if (time - lastTime < 33) {
            animId = requestAnimationFrame(animateParticles);
            return;
        }

        lastTime = time;

        ctx.clearRect(0, 0, w, h);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animId = requestAnimationFrame(animateParticles);
    }

    animId = requestAnimationFrame(animateParticles);

    // =========================
    // PAUSE SAAT TAB TIDAK AKTIF
    // =========================
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            animId = requestAnimationFrame(animateParticles);
        }
    });
}

const images = document.querySelectorAll(".memories-grid img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.querySelector(".close");

images.forEach(img => {
    img.addEventListener("click", () => {
        lightbox.style.display = "flex";
        lightboxImg.src = img.src;
    });
});

closeBtn.onclick = () => {
    lightbox.style.display = "none";
};

lightbox.onclick = (e) => {
    if (e.target !== lightboxImg) {
        lightbox.style.display = "none";
    }
};

const likeBtn = document.getElementById("likeBtn");
const likeCount = document.getElementById("likeCount");

let currentImage = "";

likeBtn.onclick = () => {
    db.ref("likes/" + currentImage).transaction((count) => {
        return (count || 0) + 1;
    });
};

db.ref("likes/" + currentImage).on("value", (snap) => {
    likeCount.innerText = snap.val() || 0;
});

function sendComment() {
    const input = document.getElementById("commentInput");
    const text = input.value;

    if (!text) return;

    db.ref("comments/" + currentImage).push({
        text: text,
        time: Date.now()
    });

    input.value = "";
}

function loadComments() {
    const container = document.getElementById("comments");
    container.innerHTML = "";

    db.ref("comments/" + currentImage).on("child_added", (snap) => {
        const data = snap.val();
        const div = document.createElement("div");
        div.innerText = data.text;
        container.appendChild(div);
    });
}

images.forEach(img => {
    img.addEventListener("click", () => {
        lightbox.style.display = "flex";
        lightboxImg.src = img.src;

        currentImage = img.src; // ID unik
        loadComments();
    });
});

/* ============================================================
   VI. UI EXTRAS (Cursor, Tilt, Context Menu, Scroll)
   ============================================================ */
function initCursor() {
    const dot = document.getElementById('c-dot'), ring = document.getElementById('c-ring');
    if(!dot || !ring) return;
    let mx = window.innerWidth/2, my = window.innerHeight/2, rx = mx, ry = my;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx+'px'; dot.style.top = my+'px'; });
    if (window.innerWidth < 768) return; const renderRing = () => { rx += (mx - rx)*0.2; ry += (my - ry)*0.2; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(renderRing); };
    renderRing();
    document.querySelectorAll('a, button, .hover-target').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
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

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const now = Date.now();

        // ❗ batasi update tiap 50ms
        if (now - lastScroll < 50) return;
        lastScroll = now;

        const ws = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;

        if(bar) bar.style.width = (ws / h) * 100 + "%";
        if(btn) ws > 500 ? btn.classList.add('visible') : btn.classList.remove('visible');

    }, { passive: true }); // 🔥 lebih ringan
}

function initObserver() {
    const elements = document.querySelectorAll('.reveal-scroll');

    // ❗ batasi maksimal 20 elemen
    elements.forEach((el, i) => {
        if (i > 20) return;

        const obs = new IntersectionObserver((entries, observer) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.2 });

        obs.observe(el);
    });

    // ❗ hapus delay berlapis
    function smoothScrollTo(target, duration) {
    window.scrollTo({
        top: target,
        behavior: "smooth"
    });
}

if (window.innerWidth > 768) {
    window.scrollTo({
        top: window.innerHeight * 0.75,
        behavior: "smooth"
    });
}
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

let replyTo = null; // global

function sendMessage() {
    const input = document.getElementById('user-input');

    if (input && input.value.trim() !== "" && database) {
        const newMessageRef = database.ref('messages').push();

        newMessageRef.set({
            text: input.value,
            timestamp: Date.now(),
            sender: "User-" + Math.floor(Math.random() * 1000),
            parent: replyTo // 🔥 ini kunci
        });

        input.value = "";
        replyTo = null; // reset
        input.placeholder = "Tulis komentar...";
    }
}

let chatActive = false;

let chatRef = null; // 🔥 simpan reference

function enableChatListener() {
    if (!database || chatActive) return;

    chatActive = true;

    const container = document.getElementById('chat-container');
    if (!container) return;

    chatRef = database.ref('messages');

chatRef.on('child_added', (snapshot) => {
    const data = snapshot.val();
    const id = snapshot.key;

    const msgDiv = document.createElement('div');
    msgDiv.className = "chat-msg";
    msgDiv.setAttribute("data-id", id);

    const text = document.createElement('span');
    text.textContent = data.sender + ": " + data.text;

    const time = document.createElement('small');
    time.textContent = new Date(data.timestamp).toLocaleTimeString();

    msgDiv.appendChild(text);
    msgDiv.appendChild(document.createElement('br'));
    msgDiv.appendChild(time);

    // 🔥 tombol reply (CUKUP SEKALI)
    const replyBtn = document.createElement('button');
    replyBtn.textContent = "Balas";
    replyBtn.onclick = () => {
        replyTo = id;
        document.getElementById('user-input').focus();
    };

    msgDiv.appendChild(replyBtn);

    // 🔥 container reply
    const replies = document.createElement('div');
    replies.className = "replies";
    msgDiv.appendChild(replies);

    // 🔥 cek parent
    if (data.parent) {
    const parentDiv = document.querySelector(
        `[data-id="${data.parent}"] .replies`
    );

    if (parentDiv) {
        parentDiv.appendChild(msgDiv);
    } else {
        // fallback: taruh sementara di bawah
        container.appendChild(msgDiv);
    }
    } else {
        container.appendChild(msgDiv);
    }

    // auto scroll
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
   VI. SWIPE MOBILE
   ============================================================ */

let startX = 0;

document.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
    let endX = e.changedTouches[0].clientX;

    if (startX > endX + 50) {
        let mobileSidebar = document.getElementById("mobileSidebar");
        let menuBtn = document.getElementById("menuBtn")
    }
});

/* ============================================================
   player SYSTEM (CUSTOM)
   ============================================================ */

const player = {
    HP: 20262027,
    maxHP: 20262027,
    MP: 51006101,
    maxMP: 51006101,

    stats: {
    // ⚔️ BASIC STATS
    STRENGTH: 1926,        // serangan fisik
    VITALITY: 2026,        // HP / ketahanan
    AGILITY: 5100,         // kecepatan / dodge
    PERCEPTION: 2027,      // akurasi / detect
    ENDURANCE: 6101,       // stamina / tahan lama
    CHARISMA: 999,        // influence / leadership
    AURA: 999,            // tekanan aura (kayak MC OP 😎)
    FATE: 999,             // keberuntungan takdir
    INSTINCT: 999         // refleks alami
},

    skills: [
        { name: "Arabic", level: 1 },
        { name: "English", level: 1 },
        { name: "Indonesian", level: 1 },
    ],

    equipment: [
    // 🔴 SS (Legendary / God Tier)
        { name: "Batch Shirt", rarity: "SS" },
        { name: "Batch Blazer", rarity: "SS" },
        { name: "OPPM Full Dress Uniform", rarity: "SS" },
        { name: "Coordinator Full Dress Uniform", rarity: "SS" },

    // 🟡 S (Epic)
        { name: "Batch Al-Qur'an", rarity: "S" },
        { name: "Batch Sandal Bag", rarity: "S" },
        { name: "Batch Cap (Peci)", rarity: "S" },

    // 🟣 A (Rare)
        { name: "Batch Plate", rarity: "A" },
        { name: "Batch Mattress", rarity: "A" },
    ]
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
