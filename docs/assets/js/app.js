function compoundData(initial, monthly, rate, years) {
  const months = years * 12;
  const monthlyRate = rate / 100 / 12;
  let balance = initial;
  const data = [];
  for (let m = 0; m <= months; m++) {
    if (m > 0) balance = (balance + monthly) * (1 + monthlyRate);
    data.push(balance);
  }
  return data;
}

function formatNumber(num) {
  return new Intl.NumberFormat(i18next.language).format(num.toFixed(2));
}

const investApp = {
  initial: 1000,
  monthly: 100,
  rate: 5,
  years: 10,
  darkMode: false,
  language: 'en',
  chart: null,
  summary: null,

  init() {
    this.language = i18next.resolvedLanguage;
    this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.renderChart();
    this.updateQueryParams();
    this.$watch('initial', () => this.renderChart());
    this.$watch('monthly', () => this.renderChart());
    this.$watch('rate', () => this.renderChart());
    this.$watch('years', () => this.renderChart());
    const params = new URLSearchParams(window.location.search);
    if (params.has('initial')) this.initial = parseFloat(params.get('initial'));
    if (params.has('monthly')) this.monthly = parseFloat(params.get('monthly'));
    if (params.has('rate')) this.rate = parseFloat(params.get('rate'));
    if (params.has('years')) this.years = parseFloat(params.get('years'));
  },

  changeLanguage() {
    i18next.changeLanguage(this.language).then(() => {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerHTML = i18next.t(el.getAttribute('data-i18n'));
      });
      this.renderChart();
    });
  },

  formatCurrency(v) {
    return new Intl.NumberFormat(i18next.language, { style: 'currency', currency: 'USD' }).format(v);
  },

  renderChart() {
    const labels = Array.from({ length: this.years * 12 + 1 }, (_, i) => i);
    const data = compoundData(this.initial, this.monthly, this.rate, this.years);
    if (!this.chart) {
      const ctx = document.getElementById('chart');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: i18next.t('balance'),
            data,
            fill: true,
            borderColor: 'rgb(37,99,235)',
            backgroundColor: 'rgba(37,99,235,0.2)'
          }]
        },
        options: {
          responsive: true,
          scales: { x: { display: false } }
        }
      });
    } else {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
    this.summary = { final: data[data.length - 1] };
  },

  share() {
    const url = new URL(window.location);
    url.searchParams.set('initial', this.initial);
    url.searchParams.set('monthly', this.monthly);
    url.searchParams.set('rate', this.rate);
    url.searchParams.set('years', this.years);
    navigator.clipboard.writeText(url.toString());
    alert(i18next.t('link_copied'));
  },

  updateQueryParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.size) {
      if (params.has('initial')) this.initial = parseFloat(params.get('initial'));
      if (params.has('monthly')) this.monthly = parseFloat(params.get('monthly'));
      if (params.has('rate')) this.rate = parseFloat(params.get('rate'));
      if (params.has('years')) this.years = parseFloat(params.get('years'));
    }
  }
};

// i18n setup
i18next
  .use(i18nextHttpBackend)
  .use(i18nextBrowserLanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: { loadPath: 'locales/{{lng}}.json' }
  }, (err, t) => {
    if (err) return console.error(err);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
  });

