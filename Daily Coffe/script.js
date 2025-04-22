(function() {
    const STORAGE_KEY = 'dailyCoffeeStats';
    const countDisplay = document.getElementById('count-display');
    const addBtn = document.getElementById('add-btn');
    const removeBtn = document.getElementById('remove-btn');
    const resetBtn = document.getElementById('reset-btn');
    const cupsContainer = document.getElementById('cups-container');
    const statsToday = document.getElementById('stats-today');
    const statsWeek = document.getElementById('stats-week');
    const statsMonth = document.getElementById('stats-month');
    const timeSinceEl = document.getElementById('time-since');
    const funFactEl = document.getElementById('fun-fact');
    const streakEl = document.getElementById('streak');
    const favoriteDayEl = document.getElementById('favorite-day');
  
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
  
    const funFacts = [
      'Coffee is the world’s second most traded commodity after crude oil.',
      'Espresso has less caffeine than drip coffee but is more concentrated.',
      'Finland is the top coffee-consuming country per capita.',
      'Coffee beans are actually seeds of a fruit often called a "cherry".',
      'Decaf coffee still contains about 1–2% of its original caffeine.'
    ];
  
    function getDailyFact() {
      const now = new Date();
      return funFacts[(now.getDate() + now.getMonth()) % funFacts.length];
    }
  
    function loadStats() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { date: new Date().toDateString(), history: [], record: {} };
      try { return JSON.parse(raw); } catch { return { date: new Date().toDateString(), history: [], record: {} }; }
    }
    function saveStats(st) { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); }
  
    let stats = loadStats();
    const todayStr = new Date().toDateString();
    if (stats.date !== todayStr) {
      stats.record[stats.date] = stats.history.length;
      stats.date = todayStr; stats.history = [];
      saveStats(stats);
    }
  
    // Initialize charts with empty data
    const weeklyChart = new Chart(weeklyCtx, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Coffees', data: [], backgroundColor: 'var(--accent-color)' }] },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
    const monthlyChart = new Chart(monthlyCtx, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Coffees', data: [], fill: false, borderColor: 'var(--accent-color)' }] },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  
    function updateRecord() {
      stats.record[stats.date] = stats.history.length;
      saveStats(stats);
    }
  
    function renderAll() {
      // Cups and counts
      countDisplay.textContent = stats.history.length;
      cupsContainer.innerHTML = '';
      stats.history.forEach(() => {
        const span = document.createElement('span');
        span.textContent = '☕'; cupsContainer.appendChild(span);
      });
      statsToday.textContent = stats.history.length;
      // Weekly & monthly numeric
      const now = new Date();
      let weekCount = 0, monthCount = 0;
      Object.entries(stats.record).forEach(([dateStr, count]) => {
        const d = new Date(dateStr), diff = now - d;
        if (diff <= 7 * 86400000) weekCount += count;
        if (diff <= 30 * 86400000) monthCount += count;
      });
      statsWeek.textContent = weekCount;
      statsMonth.textContent = monthCount;
  
      // Fun stats
      computeFunStats();
      // Charts
      updateCharts();
    }
  
    function updateCharts() {
      const now = new Date();
      // Weekly
      const weekLabels = [], weekData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i);
        const ds = d.toDateString();
        weekLabels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
        weekData.push(stats.record[ds] || 0);
      }
      weeklyChart.data.labels = weekLabels;
      weeklyChart.data.datasets[0].data = weekData;
      weeklyChart.update();
      // Monthly
      const monthLabels = [], monthData = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i);
        monthLabels.push(d.getDate());
        monthData.push(stats.record[d.toDateString()] || 0);
      }
      monthlyChart.data.labels = monthLabels;
      monthlyChart.data.datasets[0].data = monthData;
      monthlyChart.update();
    }
  
    function computeFunStats() {
      const record = stats.record;
      const dates = Object.keys(record).sort((a,b) => new Date(a)-new Date(b));
      let longest = 0, current = 0, lastDate = null;
      dates.forEach(ds => {
        if (record[ds] > 0) {
          const d = new Date(ds);
          if (lastDate && (d - new Date(lastDate) === 86400000)) { current++; }
          else { current = 1; }
          longest = Math.max(longest, current);
          lastDate = ds;
        } else { current = 0; lastDate = ds; }
      });
      streakEl.textContent = longest;
      const daySums = Array(7).fill(0);
      dates.forEach(ds => { const d=new Date(ds); daySums[d.getDay()] += record[ds]; });
      const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      favoriteDayEl.textContent = days[daySums.indexOf(Math.max(...daySums))];
    }
  
    function updateTimeSince() {
      const now = new Date();
      if (stats.history.length) {
        const last = new Date(stats.history.at(-1));
        const diff = now - last;
        const hrs = Math.floor(diff/3600000), mins = Math.floor((diff%3600000)/60000), secs = Math.floor((diff%60000)/1000);
        timeSinceEl.textContent = `Time since last coffee: ${hrs}h ${mins}m ${secs}s`;
      } else {
        timeSinceEl.textContent = 'Time since last coffee: N/A';
      }
    }
  
    function init() { renderAll(); updateTimeSince(); }
    setInterval(updateTimeSince, 1000);
  
    addBtn.addEventListener('click', () => {
      stats.history.push(new Date().toISOString()); updateRecord(); init();
      const last = cupsContainer.lastElementChild; if (last) last.classList.add('fill-animation');
    });
    removeBtn.addEventListener('click', () => {
      if (stats.history.length) { stats.history.pop(); updateRecord(); init(); }
    });
    resetBtn.addEventListener('click', () => {
      if (confirm("Reset today's coffee count?")) { stats.record[stats.date] = stats.history.length; stats.history=[]; updateRecord(); init(); }
    });
  
    funFactEl.textContent = getDailyFact();
    init();
  })();
  