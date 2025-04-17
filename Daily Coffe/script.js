(function () {
    const STORAGE_KEY = 'dailyCoffeeData';
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

    const funFacts = [
        'Coffee is the world’s second most traded commodity after crude oil.',
        'Espresso has less caffeine than drip coffee but is more concentrated.',
        'Finland is the top coffee-consuming country per capita.',
        'Coffee beans are actually seeds of a fruit often called a "cherry".',
        'Decaf coffee still contains about 1–2% of its original caffeine.'
    ];

    function getDailyFact() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const day = Math.floor(diff / 86400000);
        return funFacts[day % funFacts.length];
    }

    function loadData() {
        const raw = localStorage.getItem(STORAGE_KEY);
        const today = new Date().toDateString();
        if (!raw) return { date: today, count: 0, history: [] };
        try {
            const data = JSON.parse(raw);
            if (data.date !== today) return { date: today, count: 0, history: [] };
            return data;
        } catch (e) {
            return { date: today, count: 0, history: [] };
        }
    }

    function saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    let data = loadData();

    function renderAll() {
        countDisplay.textContent = data.count;
        cupsContainer.innerHTML = '';
        data.history.forEach(() => {
            const span = document.createElement('span');
            span.textContent = '☕';
            cupsContainer.appendChild(span);
        });
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
    }

    function updateTimeSince() {
        const now = new Date();
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

    // Initial render
    renderAll();
    updateTimeSince();
    setInterval(updateTimeSince, 1000);

    addBtn.addEventListener('click', () => {
        const nowISO = new Date().toISOString();
        data.count += 1;
        data.history.push(nowISO);
        saveData(data);
        renderAll();
        const lastCup = cupsContainer.lastElementChild;
        if (lastCup) lastCup.classList.add('fill-animation');
    });

    removeBtn.addEventListener('click', () => {
        if (data.count > 0) {
            data.count -= 1;
            data.history.pop();
            saveData(data);
            renderAll();
        }
    });

    resetBtn.addEventListener('click', () => {
        if (confirm("Reset today's coffee count?")) {
            data = { date: new Date().toDateString(), count: 0, history: [] };
            saveData(data);
            renderAll();
        }
    });

    // Set daily fun fact
    funFactEl.textContent = getDailyFact();
})();
