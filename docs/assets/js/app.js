// app.js

document.addEventListener('alpine:init', () => {
    Alpine.data('invest101', () => ({
        // --- State ---
        // Calculator inputs
        initial: 1000,
        monthly: 250,
        rate: 7,
        years: 20,

        // UI state
        lang: 'en',
        isDark: false,
        
        // Auth state
        isLoggedIn: false,
        user: null,

        // Output data
        summary: { totalInvested: 0, totalInterest: 0, finalValue: 0 },
        chartData: { labels: [], datasets: [] },

        // Library instances
        chartInstance: null,

        // --- Methods ---
        async init() {
            console.log('Invest101 app initializing...');

            this.initTheme();
            await this.initI18n();
            this.initFromUrlParams();
            this.initAuth();
            
            // Initial calculation and chart rendering
            this.calculate();

            // Watch for changes in calculator inputs to trigger updates
            this.$watch(['initial', 'monthly', 'rate', 'years'], () => this.handleInput());
            this.$watch('isDark', () => this.updateChart());
        },

        handleInput() {
            this.calculate();
            this.updateUrl();
            this.savePreset();
        },

        calculate() {
            let totalInvested = this.initial;
            let balance = this.initial;
            const monthlyRate = this.rate / 100 / 12;
            const totalMonths = this.years * 12;
            
            const labels = [];
            const principalData = [];
            const interestData = [];
            
            for (let month = 1; month <= totalMonths; month++) {
                balance += this.monthly;
                balance *= (1 + monthlyRate);
                totalInvested += this.monthly;
                
                // For the chart, add data point once per year
                if (month % 12 === 0 || month === totalMonths) {
                    labels.push(`${i18next.t('chart.year')} ${Math.ceil(month / 12)}`);
                    principalData.push(totalInvested.toFixed(0));
                    interestData.push((balance - totalInvested).toFixed(0));
                }
            }

            this.summary = {
                totalInvested: totalInvested,
                totalInterest: balance - totalInvested,
                finalValue: balance,
            };

            this.chartData = {
                labels,
                datasets: [
                    {
                        label: i18next.t('chart.contributions'),
                        data: principalData,
                        backgroundColor: this.isDark ? 'rgb(99 102 241)' : 'rgb(79 70 229)', // Indigo
                        stack: 'stack1',
                    },
                    {
                        label: i18next.t('chart.interest'),
                        data: interestData,
                        backgroundColor: this.isDark ? 'rgb(52 211 153)' : 'rgb(22 163 74)', // Green
                        stack: 'stack1',
                    },
                ]
            };
            this.updateChart();
        },

        updateChart() {
            if (!this.chartInstance) {
                this.chartInstance = createGrowthChart(
                    document.getElementById('growthChart'),
                    this.chartData,
                    this.isDark
                );
            } else {
                updateChartInstance(this.chartInstance, this.chartData, this.isDark);
            }
        },

        // --- Feature Implementations ---

        // F3: i18n
        async initI18n() {
            await i18next
                .use(i18nextHttpBackend)
                .init({
                    lng: navigator.language.split('-')[0] || 'en', // Autodetect
                    fallbackLng: 'en',
                    ns: ['translation'],
                    defaultNS: 'translation',
                    backend: { loadPath: 'locales/{{lng}}.json' }
                });
            this.lang = i18next.language;
            this.translatePage();
        },
        changeLanguage(newLang) {
            this.lang = newLang;
            i18next.changeLanguage(newLang, () => {
                this.translatePage();
                this.calculate(); // Recalculate to update chart labels
            });
        },
        translatePage() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if(el.hasAttribute('content')) {
                    el.setAttribute('content', i18next.t(key));
                } else {
                    el.innerHTML = i18next.t(key);
                }
            });
        },

        // F2: Personalisation
        initAuth() {
            firebase.auth.onAuthStateChanged(window.firebaseAuth, (user) => {
                if (user) {
                    this.isLoggedIn = true;
                    this.user = { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL };
                    console.log('User logged in:', this.user.displayName);
                    // In a real app, you would load presets from Firebase here.
                    // For now, we still rely on localStorage but could sync it.
                } else {
                    this.isLoggedIn = false;
                    this.user = null;
                    console.log('User logged out.');
                    this.loadPreset(); // Load from localStorage for guest user
                }
            });
        },
        async login() {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await firebase.auth.signInWithPopup(window.firebaseAuth, provider);
            } catch (error) {
                console.error("Login failed:", error);
            }
        },
        async logout() {
            try {
                await firebase.auth.signOut(window.firebaseAuth);
            } catch (error) {
                console.error("Logout failed:", error);
            }
        },
        savePreset() {
            const preset = { initial: this.initial, monthly: this.monthly, rate: this.rate, years: this.years };
            localStorage.setItem('invest101_preset', JSON.stringify(preset));
            // if (this.isLoggedIn) { /* TODO: Sync to Firebase */ }
        },
        loadPreset() {
            const saved = localStorage.getItem('invest101_preset');
            if (saved) {
                const preset = JSON.parse(saved);
                Object.assign(this, preset);
            }
        },

        // F4: Dark Mode
        initTheme() {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                this.isDark = true;
                document.documentElement.classList.add('dark');
            } else {
                this.isDark = false;
                document.documentElement.classList.remove('dark');
            }
        },
        toggleTheme() {
            this.isDark = !this.isDark;
            localStorage.theme = this.isDark ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', this.isDark);
        },

        // F5: Permalink
        updateUrl() {
            const params = new URLSearchParams({
                initial: this.initial,
                monthly: this.monthly,
                rate: this.rate,
                years: this.years
            });
            history.pushState(null, '', `?${params.toString()}`);
        },
        initFromUrlParams() {
            const params = new URLSearchParams(window.location.search);
            const urlState = {
                initial: params.get('initial'),
                monthly: params.get('monthly'),
                rate: params.get('rate'),
                years: params.get('years'),
            };

            for (const key in urlState) {
                if (urlState[key] !== null && !isNaN(parseFloat(urlState[key]))) {
                    this[key] = parseFloat(urlState[key]);
                } else {
                    this.loadPreset(); // If no/invalid params, fall back to stored preset
                    break;
                }
            }
        },
        
        // --- Utilities ---
        formatCurrency(value) {
            return new Intl.NumberFormat(this.lang, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
            // Note: Currency is hardcoded to USD. A real app might switch based on lang (EUR for es/ca).
        }
    }));
});
