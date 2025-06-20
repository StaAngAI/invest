// charts.js

function getChartOptions(isDark) {
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#cbd5e1' : '#475569'; // slate-300 / slate-600
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: textColor, font: { size: 12 } }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: { color: 'transparent' },
                ticks: { color: textColor }
            },
            y: {
                stacked: true,
                grid: { color: gridColor },
                ticks: {
                    color: textColor,
                    callback: (value) => new Intl.NumberFormat('en-US', {
                        style: 'currency', currency: 'USD', notation: 'compact' 
                    }).format(value),
                },
            },
        },
    };
}

function createGrowthChart(ctx, data, isDark) {
    return new Chart(ctx, {
        type: 'bar',
        data: data,
        options: getChartOptions(isDark)
    });
}

function updateChartInstance(chart, data, isDark) {
    if (!chart) return;
    
    // Update data
    chart.data.labels = data.labels;
    chart.data.datasets.forEach((dataset, index) => {
        dataset.data = data.datasets[index].data;
        dataset.backgroundColor = data.datasets[index].backgroundColor;
    });

    // Update options for theme change
    chart.options = getChartOptions(isDark);
    
    chart.update();
}
