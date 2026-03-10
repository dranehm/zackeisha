const rsvpForm = document.getElementById('rsvpForm');
const rsvpContent = document.getElementById('rsvpContent');
const thankYou = document.getElementById('thankYou');

rsvpForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // gather form values
    const nameInput = rsvpForm.querySelector('input[type="text"]');
    const attendingInput = rsvpForm.querySelector('input[name="attending"]:checked');
    const messageInput = rsvpForm.querySelector('textarea');
    const entry = {
        name: nameInput ? nameInput.value.trim() : '',
        attending: attendingInput ? attendingInput.value : '',
        message: messageInput ? messageInput.value.trim() : '',
        timestamp: new Date().toISOString()
    };

    // send to Google Sheets via Apps Script web app
    console.log('Sending data:', entry);
    fetch('https://script.google.com/macros/s/AKfycbxBcciG6o5oMi1pTodBsJb-kKS8EDIVAQrYhLjC8_DOPXz6VSTNLUV1RRRJ51SumzcAvQ/exec', {
        method: 'POST',
        mode: 'no-cors',        // ← must be 'no-cors', NOT 'cors'
        body: JSON.stringify(entry),
        headers: {
            'Content-Type': 'text/plain'   // ← must be 'text/plain', NOT 'application/json'
        }
    })
    .then(() => {
        rsvpContent.classList.add('hidden');
        thankYou.classList.remove('hidden');
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('Network error: ' + error.message);
    });
});

// optional: print count to console on load (removed localStorage dependency)


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
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();

// smooth scrolling utility for consistent behavior across devices
function smoothScrollTo(targetY, duration = 600) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const time = timestamp - startTime;
        const percent = Math.min(time / duration, 1);
        // ease-in-out quadratic
        const ease = percent < 0.5 ? 2 * percent * percent : -1 + (4 - 2 * percent) * percent;
        window.scrollTo(0, startY + distance * ease);
        if (time < duration) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

const detailsLink = document.getElementById('detailsLink');
if (detailsLink) {
    detailsLink.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.getElementById('details');
        if (target) {
            smoothScrollTo(target.offsetTop);
        }
        history.pushState(null, '', '#details');
    });
}