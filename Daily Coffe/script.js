(function() {
  const STORAGE_KEY = 'dailyCoffeeData';
  const countDisplay = document.getElementById('count-display');
  const addBtn = document.getElementById('add-btn');
  const resetBtn = document.getElementById('reset-btn');
  const cupsContainer = document.getElementById('cups-container');
  const statsToday = document.getElementById('stats-today');
  const statsWeek = document.getElementById('stats-week');
  const statsMonth = document.getElementById('stats-month');
  const timeSinceEl = document.getElementById('time-since');
  const funFactEl = document.getElementById('fun-fact');
  const newFactBtn = document.getElementById('new-fact-btn');

  const funFacts = [
    'Coffee is the world’s second most traded commodity after crude oil.',
    'Espresso has less caffeine than drip coffee but is more concentrated.',
    'Finland is the top coffee-consuming country per capita.',
    'Coffee beans are actually seeds of a fruit often called a "cherry".',
    'Decaf coffee still contains about 1–2% of its original caffeine.'
  ];

  // Load or initialize data
  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toDateString();
    if (!raw) return { date: today, count: 0, history: [] };
    try {
      const data = JSON.parse(raw);
      if (data.date !== today) return { date: today, count: 0, history: [] };
      return data;
    } catch(e) {
      return { date: today, count: 0, history: [] };
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  let data = loadData();

  // Render UI
  function render() {
    countDisplay.textContent = data.count;

    // Animated fill-up
    cupsContainer.innerHTML = '';
    data.history.forEach(ts => {
      const span = document.createElement('span');
      span.textContent = '☕';
      span.classList.add('fill-animation');
      cupsContainer.appendChild(span);
    });

    // Stats
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);

    let weekCount = 0, monthCount = 0;
    data.history.forEach(ts => {
      const d = new Date(ts);
      if (d >= weekAgo) weekCount++;
      if (d >= monthAgo) monthCount++;
    });
    statsToday.textContent = data.count;
    statsWeek.textContent = weekCount;
    statsMonth.textContent = monthCount;

    // Time since last coffee
    if (data.history.length > 0) {
      const lastTs = new Date(data.history[data.history.length - 1]);
      const diffMs = now - lastTs;
      const hrs = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      timeSinceEl.textContent = `Time since last coffee: ${hrs}h ${mins}m ${secs}s`;
    } else {
      timeSinceEl.textContent = 'Time since last coffee: N/A';
    }
  }

  // Update timer every second
  setInterval(() => render(), 1000);

  // Event handlers
  addBtn.addEventListener('click', () => {
    const now = new Date().toISOString();
    data.count += 1;
    data.history.push(now);
    saveData(data);
    render();
  });

  resetBtn.addEventListener('click', () => {
    if (confirm("Reset today's coffee count?")) {
      data = { date: new Date().toDateString(), count: 0, history: [] };
      saveData(data);
      render();
    }
  });

  newFactBtn.addEventListener('click', () => {
    const idx = Math.floor(Math.random() * funFacts.length);
    funFactEl.textContent = funFacts[idx];
  });

  // Initial fun fact
  funFactEl.textContent = funFacts[Math.floor(Math.random() * funFacts.length)];

  // Initial render
  render();
})();
