const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxBcciG6o5oMi1pTodBsJb-kKS8EDIVAQrYhLjC8_DOPXz6VSTNLUV1RRRJ51SumzcAvQ/exec';

// ─── RSVP Form ───────────────────────────────────────────────────────────────
const rsvpForm = document.getElementById('rsvpForm');
const rsvpContent = document.getElementById('rsvpContent');
const thankYou = document.getElementById('thankYou');

rsvpForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const nameInput = rsvpForm.querySelector('input[type="text"]');
    const attendingInput = rsvpForm.querySelector('input[name="attending"]:checked');
    const messageInput = rsvpForm.querySelector('textarea');
    const entry = {
        name: nameInput ? nameInput.value.trim() : '',
        attending: attendingInput ? attendingInput.value : '',
        message: messageInput ? messageInput.value.trim() : '',
        timestamp: new Date().toISOString()
    };

    console.log('Sending data:', entry);
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(entry),
        headers: { 'Content-Type': 'text/plain' }
    })
    .then(() => {
        rsvpContent.classList.add('hidden');
        thankYou.classList.remove('hidden');
        // Refresh count after a new RSVP is submitted
        setTimeout(fetchAttendeeCount, 1500);
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('Network error: ' + error.message);
    });
});


// ─── Attendee Count ──────────────────────────────────────────────────────────
function fetchAttendeeCount() {
    fetch(APPS_SCRIPT_URL)
        .then(res => res.json())
        .then(data => {
            const countEl = document.getElementById('attendeeCount');
            const labelEl = document.getElementById('attendeeLabel');
            if (countEl) {
                countEl.textContent = data.attendingYes ?? data.total ?? '—';
            }
            if (labelEl) {
                // pluralise gracefully
                const n = data.attendingYes ?? 0;
                labelEl.textContent = n === 1 ? 'Guest Attending' : 'Guests Attending';
            }
        })
        .catch(err => {
            console.warn('Could not fetch attendee count:', err);
            const countEl = document.getElementById('attendeeCount');
            if (countEl) countEl.textContent = '—';
        });
}

// Fetch on page load
fetchAttendeeCount();


// ─── Countdown Timer ─────────────────────────────────────────────────────────
const targetDate = new Date('March 17, 2026 10:00:00').getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('days').innerText = d.toString().padStart(2, '0');
        document.getElementById('hours').innerText = h.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = m.toString().padStart(2, '0');
    } else {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();


// ─── Smooth Scroll ───────────────────────────────────────────────────────────
function smoothScrollTo(targetY, duration = 600) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const time = timestamp - startTime;
        const percent = Math.min(time / duration, 1);
        const ease = percent < 0.5 ? 2 * percent * percent : -1 + (4 - 2 * percent) * percent;
        window.scrollTo(0, startY + distance * ease);
        if (time < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

const detailsLink = document.getElementById('detailsLink');
if (detailsLink) {
    detailsLink.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.getElementById('details');
        if (target) smoothScrollTo(target.offsetTop);
        history.pushState(null, '', '#details');
    });
}