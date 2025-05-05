document.addEventListener('DOMContentLoaded', () => {
    const form       = document.getElementById('goal-form');
    const countdown  = document.getElementById('countdown');
    const daysEl     = document.getElementById('days');
    const hoursEl    = document.getElementById('hours');
    const minutesEl  = document.getElementById('minutes');
    const secondsEl  = document.getElementById('seconds');
    const goalLabel  = document.getElementById('goal-label');
    const resetBtn   = document.getElementById('reset-btn');
    let   targetTime, intervalId;
  
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name      = document.getElementById('goal-name').value.trim();
      const dateInput = document.getElementById('goal-date').value;
      if (!name || !dateInput) return;
  
      targetTime      = new Date(dateInput).getTime();
      goalLabel.textContent = name;
      form.style.display     = 'none';
      countdown.style.display = 'flex';
  
      updateCountdown();
      intervalId = setInterval(updateCountdown, 1000);
    });
  
    resetBtn.addEventListener('click', () => {
      clearInterval(intervalId);
      form.reset();
      form.style.display     = 'block';
      countdown.style.display = 'none';
    });
  
    function updateCountdown() {
      const now  = Date.now();
      const diff = targetTime - now;
  
      if (diff <= 0) {
        clearInterval(intervalId);
        daysEl.textContent    = '0';
        hoursEl.textContent   = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        goalLabel.textContent += ' – Time reached!';
        return;
      }
  
      const d = Math.floor(diff / 1000 / 60 / 60 / 24);
      const h = Math.floor((diff / 1000 / 60 / 60) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
  
      daysEl.textContent    = d;
      hoursEl.textContent   = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');
    }
  });
  