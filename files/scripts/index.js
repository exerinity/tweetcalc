const ros = [
    n => n < 0.1 ? `Less than 1 Tweet every 10 days. They opened the app once, got scared, and left.` : null,
    n => n < 0.5 ? `A casual lurker. Probably only Tweets when something makes them genuinely angry` : null,
    n => n < 1 ? `Less than once a day. They have what doctors call "restraint"` : null,
    n => n < 2 ? `About once a day. Healthy... normal... <i>suspicious</i>.` : null,
    n => n < 5 ? `A few Tweets a day. They have opinions and they're not afraid to share them... concerningly.` : null,
    n => n < 10 ? `Multiple times a day. Twitter is definitely open in a pinned tab 24/7` : null,
    n => n < 20 ? `This person has replaced meals with Tweets` : null,
    n => n < 40 ? `One Tweet every ~40 minutes on average. They are always online. Always watching` : null,
    n => n < 100 ? `This is less a person and more a content firehose. Do they sleep?` : null,
    n => `${n.toFixed(1)} Tweets an hour. This is either a bot or a very unwell individual`,
];

function grs(ph) {
    for (const r of ros) {
        const v = r(ph);
        if (v) return v;
    }
}

function fmt(n) {
    return parseFloat(n.toFixed(2)).toString();
}

function ptc(r) {
    const s = r.trim().replace(/,/g, '').toLowerCase();
    if (!s) return NaN;
    const m = s.match(/^(\d+\.?\d*)(k|m)?$/);
    if (!m) return NaN;
    const n = parseFloat(m[1]);
    if (m[2] === 'k') return Math.round(n * 1_000);
    if (m[2] === 'm') return Math.round(n * 1_000_000);
    return Math.round(n);
}

function calc() {
    const mo = parseInt(document.getElementById('month').value, 10);
    const yr = parseInt(document.getElementById('year').value, 10);
    const dv = document.getElementById('day').value.trim();
    const tw = ptc(document.getElementById('tweets').value);
    const err = document.getElementById('error');
    const res = document.getElementById('results');

    const serr = m => {
        err.textContent = m;
        err.classList.add('visible');
        res.classList.remove('visible');
    };

    if (!mo || !yr || isNaN(mo) || isNaN(yr) || !tw || isNaN(tw) || tw < 0) {
        return serr('Month, year, and Tweet count are required. Day is optional.');
    }
    if (mo < 1 || mo > 12) return serr('Month should be 1 - 12.');
    if (yr < 2006) return serr('Twitter launched in 2006. Go back.');

    let ea, la;
    const hd = dv !== '' && !isNaN(parseInt(dv, 10));

    if (hd) {
        const d = parseInt(dv, 10);
        ea = la = new Date(yr, mo - 1, d, 12, 0, 0);
    } else {
        ea = new Date(yr, mo - 1, 1);
        la = new Date(yr, mo, 0);
    }

    const now = new Date();

    if (ea > now) return serr('Account join date is in the future...?');
    if (la > now) la = now;

    err.classList.remove('visible');

    const mpd = 1000 * 60 * 60 * 24;

    const dm = (now - la) / mpd;
    const dx = (now - ea) / mpd;

    const pdm = tw / dx;
    const pdx = tw / dm;
    const phm = pdm / 24;
    const phx = pdx / 24;

    const ex = hd || Math.abs(dx - dm) < 1;

    const fr = (a, b) => ex ? fmt(a) : `${fmt(a)} – ${fmt(b)}`;

    const md = (dm + dx) / 2;
    const yrs = md / 365.25;
    let as;
    if (yrs >= 1) {
        const y = Math.floor(yrs);
        const rd = Math.round((yrs - y) * 365.25);
        as = (ex ? '' : '~') + `${y}y ${rd}d`;
    } else {
        as = (ex ? '' : '~') + `${Math.round(md)}d`;
    }

    document.getElementById('age').textContent = as;
    document.getElementById('perDay').textContent = fr(pdm, pdx);
    document.getElementById('perHour').textContent = fr(phm, phx);
    document.getElementById('roast').textContent = grs((phm + phx) / 2);

    res.classList.add('visible');
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') calc(); });

(function () {
    const p = new URLSearchParams(location.search);
    const set = (id, key) => { if (p.has(key)) document.getElementById(id).value = p.get(key); };
    set('month', 'month');
    set('year', 'year');
    set('day', 'day');
    set('tweets', 'tweets');
    if (p.has('month') && p.has('year') && p.has('tweets')) calc();
})();
