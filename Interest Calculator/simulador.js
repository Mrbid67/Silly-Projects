document.addEventListener('DOMContentLoaded', () => {
    // Inputs principales
    const principalInput      = document.getElementById('principal');
    const interestInput       = document.getElementById('interest');
    const compoundingSel      = document.getElementById('compounding');
    const monthlyContribInput = document.getElementById('monthly-contrib');
    const yearsSlider         = document.getElementById('years');
    const yearsValueLabel     = document.getElementById('years-value');
  
    // Resultados
    const resultsEl           = document.getElementById('results');
    const interestEarnedEl    = document.getElementById('interest-earned');
    const totalBalanceEl      = document.getElementById('total-balance');
    const interestYearEl      = document.getElementById('interest-year');
    const interestMonthEl     = document.getElementById('interest-month');
    const interestDayEl       = document.getElementById('interest-day');
  
    // Canvas para Chart.js
    const ctx = document.getElementById('growthChart').getContext('2d');
    let growthChart = null;
  
    // Formato moneda
    function formatCurrency(value) {
      return value.toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR'
      });
    }
  
    // Carga estado previo de localStorage
    ['principal','interest','compounding','monthlyContrib','years'].forEach(key => {
      const el = {
        principal: principalInput,
        interest: interestInput,
        compounding: compoundingSel,
        monthlyContrib: monthlyContribInput,
        years: yearsSlider
      }[key];
      if (localStorage.getItem(key)) {
        el.value = localStorage.getItem(key);
        if (key === 'years') yearsValueLabel.textContent = el.value;
      }
    });
  
    // Guarda en localStorage
    function saveState(key, value) {
      localStorage.setItem(key, value);
    }
  
   // Función actualizada de simulación que devuelve más datos
function simulate() {
    const principal      = parseFloat(principalInput.value);
    const ratePercent    = parseFloat(interestInput.value);
    const compFreq       = parseInt(compoundingSel.value, 10);
    const monthlyContrib = parseFloat(monthlyContribInput.value) || 0;
    const years          = parseInt(yearsSlider.value, 10);
  
    if (isNaN(principal) || isNaN(ratePercent)) {
      return null;
    }
  
    const rate = ratePercent / 100;
    const monthlyRate = Math.pow(1 + rate/compFreq, compFreq/12) - 1;
    const totalMonths = years * 12;
  
    let balance = principal;
    let totalContrib = principal;
  
    const labels = ['0 años'];
    const balances = [principal];
    const contributions = [principal];
    const interests = [0];
  
    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + monthlyContrib;
      totalContrib += monthlyContrib;
  
      if (m % 12 === 0) {
        labels.push(`${m/12} años`);
        balances.push(parseFloat(balance.toFixed(2)));
        contributions.push(parseFloat(totalContrib.toFixed(2)));
        interests.push(parseFloat((balance - totalContrib).toFixed(2)));
      }
    }
  
    const interestAmount = balance - totalContrib;
  
    return {
      balance,
      interestAmount,
      interestPerYear: interestAmount / years,
      interestPerMonth: (interestAmount / years) / 12,
      interestPerDay: (interestAmount / years) / 365,
      chart: { labels, balances, contributions, interests }
    };
  }
  
  // Actualiza la gráfica con tres datasets
  function updateChart(chartData) {
    if (!chartData) return;
    const { labels, balances, contributions, interests } = chartData;
  
    if (!growthChart) {
      growthChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Saldo total acumulado',
              data: balances,
              fill: false,
              tension: 0.2,
              borderColor: '#bb86fc',
              backgroundColor: 'rgba(187,134,252,0.5)',
              borderWidth: 3
            },
            {
              label: 'Aportaciones totales',
              data: contributions,
              fill: false,
              tension: 0.2,
              borderColor: '#03dac5',
              backgroundColor: 'rgba(3,218,197,0.5)',
              borderWidth: 2,
              borderDash: [5,5]
            },
            {
              label: 'Intereses acumulados',
              data: interests,
              fill: false,
              tension: 0.2,
              borderColor: '#ff7597',
              backgroundColor: 'rgba(255,117,151,0.5)',
              borderWidth: 2
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: v => formatCurrency(v)
              }
            }
          },
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
              }
            }
          }
        }
      });
    } else {
      growthChart.data.labels = labels;
      growthChart.data.datasets[0].data = balances;
      growthChart.data.datasets[1].data = contributions;
      growthChart.data.datasets[2].data = interests;
      growthChart.update();
    }
  }
  
  
    // Calcula y actualiza todo
    function calculate() {
      const result = simulate();
      if (!result) {
        resultsEl.style.display = 'none';
        return;
      }
  
      // Estadísticos en texto
      interestEarnedEl.textContent =
        `💰 Interés total: ${formatCurrency(result.interestAmount)}`;
      totalBalanceEl.textContent =
        `💰 Saldo final: ${formatCurrency(result.balance)}`;
      interestYearEl.textContent =
        `💸 Interés anual promedio: ${formatCurrency(result.interestPerYear)}`;
      interestMonthEl.textContent =
        `💸 Interés mensual promedio: ${formatCurrency(result.interestPerMonth)}`;
      interestDayEl.textContent =
        `💸 Interés diario promedio: ${formatCurrency(result.interestPerDay)}`;
  
      resultsEl.style.display = 'flex';
      resultsEl.style.flexDirection = 'column';
      resultsEl.style.gap = '10px';
  
      // Gráfico
      updateChart(result.chart);
    }
  
    // Listeners: guardan estado y recalculan
    principalInput.addEventListener('input', () => { saveState('principal', principalInput.value); calculate(); });
    interestInput.addEventListener('input', () => { saveState('interest', interestInput.value); calculate(); });
    compoundingSel.addEventListener('input', () => { saveState('compounding', compoundingSel.value); calculate(); });
    monthlyContribInput.addEventListener('input', () => { saveState('monthlyContrib', monthlyContribInput.value); calculate(); });
    yearsSlider.addEventListener('input', () => {
      saveState('years', yearsSlider.value);
      yearsValueLabel.textContent = yearsSlider.value;
      calculate();
    });
  
    // Cálculo inicial
    calculate();
  });
  