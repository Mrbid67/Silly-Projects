document.addEventListener("DOMContentLoaded", function () {
  // Grab DOM elements
  const salaryInput = document.getElementById("salary");
  const startTimeInput = document.getElementById("start-time");
  const endTimeInput = document.getElementById("end-time");
  const currencyInput = document.getElementById("currency");
  const updateButton = document.getElementById("updateSettings");
  const settingsContainer = document.getElementById("settings");
  const gearIcon = document.getElementById("gearIcon");
  const clockElement = document.getElementById("clock");
  const workingStatusEl = document.getElementById("working-status");
  const workProgressEl = document.getElementById("work-progress");
  const progressLabel = document.getElementById("progress-label");
  const workingDayCheckboxes = document.querySelectorAll(".working-day");

  // New: Audio elements
  const chimeSound = document.getElementById("chime-sound");
  const soundToggle = document.getElementById("sound-enabled");

  // Currency mapping
  const currencySymbols = {
    EUR: "€",
    USD: "$",
    GBP: "£"
  };

  // Helper function to get the current currency symbol.
  function getCurrencySymbol() {
    return currencySymbols[currencyInput.value] || "€";
  }

  // Load saved settings from localStorage (if available)
  if (localStorage.getItem("monthlySalary")) {
    salaryInput.value = localStorage.getItem("monthlySalary");
    settingsContainer.style.display = "none";
  }
  if (localStorage.getItem("workStart")) {
    startTimeInput.value = localStorage.getItem("workStart");
  }
  if (localStorage.getItem("workEnd")) {
    endTimeInput.value = localStorage.getItem("workEnd");
  }
  if (localStorage.getItem("currency")) {
    currencyInput.value = localStorage.getItem("currency");
  }
  if (localStorage.getItem("workingDays")) {
    let savedDays = JSON.parse(localStorage.getItem("workingDays"));
    workingDayCheckboxes.forEach(cb => {
      cb.checked = savedDays.includes(parseInt(cb.value));
    });
  } else {
    // Default to Monday (1) through Friday (5)
    workingDayCheckboxes.forEach(cb => {
      if (["1", "2", "3", "4", "5"].includes(cb.value)) {
        cb.checked = true;
      } else {
        cb.checked = false;
      }
    });
  }
  
  // Load sound setting
  const soundEnabled = localStorage.getItem("soundEnabled") === "true";
  soundToggle.checked = soundEnabled;

  // Milestone settings: milestones to celebrate (in selected currency)
  const milestones = [10, 100, 1000];
  let milestoneIndex = 0;
  let currentMilestoneDay = new Date().toDateString();

  // Utility: Parse "HH:MM" string into an object with hours and minutes.
  function parseTimeString(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours, minutes };
  }

  // Get work start and end Date objects for the provided day.
  function getWorkStartAndEnd(date) {
    const start = parseTimeString(startTimeInput.value);
    const end = parseTimeString(endTimeInput.value);

    let workStart = new Date(date);
    workStart.setHours(start.hours, start.minutes, 0, 0);

    let workEnd = new Date(date);
    workEnd.setHours(end.hours, end.minutes, 0, 0);

    return { workStart, workEnd };
  }

  // Check if a date is a working day based on user settings.
  function isWorkingDay(date) {
    let workingDays = localStorage.getItem("workingDays");
    if (workingDays) {
      workingDays = JSON.parse(workingDays);
    } else {
      // Default working days: Monday through Friday
      workingDays = [1, 2, 3, 4, 5];
    }
    return workingDays.includes(date.getDay());
  }

  // Count working days in a given month.
  function countWorkingDaysInMonth(year, month) {
    let count = 0;
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (isWorkingDay(date)) count++;
      date.setDate(date.getDate() + 1);
    }
    return count;
  }

  // Calculate the daily salary based on monthly salary and working days.
  function getDailySalary(date) {
    const monthlySalary = parseFloat(salaryInput.value);
    const workingDays = countWorkingDaysInMonth(date.getFullYear(), date.getMonth());
    return monthlySalary / workingDays;
  }

  // Compute live earnings for today, week, and month.
  function computeLiveEarnings() {
    const now = new Date();
    const { workStart, workEnd } = getWorkStartAndEnd(now);

    let dailyEarnings = getDailySalary(now);
    let secondsInWorkDay = (workEnd - workStart) / 1000;
    let currentDayEarnings = 0;

    if (isWorkingDay(now)) {
      if (now < workStart) {
        currentDayEarnings = 0;
      } else if (now > workEnd) {
        currentDayEarnings = dailyEarnings;
      } else {
        let secondsWorked = (now - workStart) / 1000;
        currentDayEarnings = (secondsWorked / secondsInWorkDay) * dailyEarnings;
      }
    }

    // Calculate weekly earnings:
    let weekEarnings = 0;
    // Find Monday of the current week.
    let monday = new Date(now);
    let dayOfWeek = now.getDay();
    let diffToMonday = (dayOfWeek + 6) % 7; // Adjust so Monday is first.
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    let current = new Date(monday);
    while (current <= now) {
      if (isWorkingDay(current)) {
        if (current.toDateString() === now.toDateString()) {
          weekEarnings += currentDayEarnings;
        } else {
          weekEarnings += getDailySalary(current);
        }
      }
      current.setDate(current.getDate() + 1);
    }

    // Calculate monthly earnings:
    let monthEarnings = 0;
    let date = new Date(now.getFullYear(), now.getMonth(), 1);
    while (date <= now) {
      if (isWorkingDay(date)) {
        if (date.toDateString() === now.toDateString()) {
          monthEarnings += currentDayEarnings;
        } else {
          monthEarnings += getDailySalary(date);
        }
      }
      date.setDate(date.getDate() + 1);
    }

    // Per-second, per-minute, and per-hour earnings.
    const perSecond = dailyEarnings / secondsInWorkDay;
    const perMinute = perSecond * 60;
    const perHour = perSecond * 3600;

    return {
      perSecond,
      perMinute,
      perHour,
      today: currentDayEarnings,
      week: weekEarnings,
      month: monthEarnings
    };
  }

  // Helper: Format milliseconds into "Hh Mm Ss" format.
  function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  // Update the real-time clock.
  function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  // Trigger confetti animation using canvas-confetti.
  function triggerConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  // Helper functions for milestone data in localStorage
  function getMilestoneData() {
    const data = localStorage.getItem("milestoneData");
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return { date: "", index: 0 };
      }
    }
    return { date: "", index: 0 };
  }

  function saveMilestoneData(data) {
    localStorage.setItem("milestoneData", JSON.stringify(data));
  }

  // At the start, load milestone data
  let milestoneData = getMilestoneData();
  const todayString = new Date().toDateString();
  // If the stored date isn’t today, reset the milestone index
  if (milestoneData.date !== todayString) {
    milestoneData = { date: todayString, index: 0 };
    saveMilestoneData(milestoneData);
  }

  // Update the dashboard and check for milestones.
  function updateDashboard() {
    const now = new Date();
    
    // If a new day has started, reset milestoneData
    if (now.toDateString() !== milestoneData.date) {
      milestoneData = { date: now.toDateString(), index: 0 };
      saveMilestoneData(milestoneData);
    }

    const earnings = computeLiveEarnings();
    const { workStart, workEnd } = getWorkStartAndEnd(now);
    const symbol = getCurrencySymbol();

    document.getElementById("per-second").textContent =
      "💸 Earning per second: " + symbol + earnings.perSecond.toFixed(4);
    document.getElementById("per-minute").textContent =
      "💸 Earning per minute: " + symbol + earnings.perMinute.toFixed(2);
    document.getElementById("per-hour").textContent =
      "💸 Earning per hour: " + symbol + earnings.perHour.toFixed(2);

    document.getElementById("today").textContent =
      "💰 Today: " + symbol + earnings.today.toFixed(2);
    document.getElementById("week").textContent =
      "💰 This Week: " + symbol + earnings.week.toFixed(2);
    document.getElementById("month").textContent =
      "💰 This Month: " + symbol + earnings.month.toFixed(2);

    // Check milestone thresholds and trigger celebrations only once per day.
    if (milestoneData.index < milestones.length && earnings.today >= milestones[milestoneData.index]) {
      triggerConfetti();
      
      // Play chime if sound is enabled.
      if (soundToggle.checked) {
        chimeSound.currentTime = 0;
        chimeSound.play();
      }

      milestoneData.index++;
      saveMilestoneData(milestoneData);
    }

    // Update Working Hours Indicator.
    if (isWorkingDay(now) && now >= workStart && now <= workEnd) {
      workingStatusEl.textContent = "Currently Working 🟢";
      workingStatusEl.classList.remove("not-working");
      workingStatusEl.classList.add("working");
    } else {
      workingStatusEl.textContent = "Currently Not Working 🔴";
      workingStatusEl.classList.remove("working");
      workingStatusEl.classList.add("not-working");
    }

    // Update "Time Left in Workday" Progress Bar.
    let progress = 0;
    if (isWorkingDay(now)) {
      if (now < workStart) {
        progress = 0;
        progressLabel.textContent = "Work day hasn't started";
      } else if (now > workEnd) {
        progress = 100;
        progressLabel.textContent = "Work day finished";
      } else {
        progress = ((now - workStart) / (workEnd - workStart)) * 100;
        let timeLeftMs = workEnd - now;
        progressLabel.textContent = "Time left: " + formatTime(timeLeftMs);
      }
    } else {
      progress = 0;
      progressLabel.textContent = "Not a working day";
    }
    workProgressEl.style.width = progress + "%";
  }

  // Update dashboard and clock every second.
  setInterval(function () {
    updateDashboard();
    updateClock();
  }, 1000);
  updateDashboard();
  updateClock();

  // Save settings to localStorage when the user clicks the Save Settings button.
  updateButton.addEventListener("click", function () {
    if (
      salaryInput.value !== "" &&
      startTimeInput.value !== "" &&
      endTimeInput.value !== ""
    ) {
      localStorage.setItem("monthlySalary", salaryInput.value);
      localStorage.setItem("workStart", startTimeInput.value);
      localStorage.setItem("workEnd", endTimeInput.value);
      localStorage.setItem("currency", currencyInput.value);
      // Gather working day selections.
      let selectedDays = [];
      workingDayCheckboxes.forEach(cb => {
        if (cb.checked) {
          selectedDays.push(parseInt(cb.value));
        }
      });
      localStorage.setItem("workingDays", JSON.stringify(selectedDays));
      // Save sound setting
      localStorage.setItem("soundEnabled", soundToggle.checked);
      settingsContainer.style.display = "none";
    }
  });

  // Toggle settings display when the gear icon is clicked.
  gearIcon.addEventListener("click", function () {
    settingsContainer.style.display = settingsContainer.style.display === "none" ? "block" : "none";
  });
});
