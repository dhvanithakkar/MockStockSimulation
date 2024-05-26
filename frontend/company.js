function logout() {
    // Redirect to index.html
    window.location.href = 'index.html';
}
function createChart(chartId, data, timestamps, detailsId) {
    var ctx = document.getElementById(chartId).getContext('2d');
    var detailsContainer = document.getElementById(detailsId);
    var chartContainer = detailsContainer.querySelector('.chart-container');

    // Set the chart container's width and height
    chartContainer.style.width = '75%'; // Set the chart container's width to 75%
    chartContainer.style.height = '100%'; // Set the chart container's height to 100%

    // Create the chart with the dynamically set dimensions
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: chartId.split('-')[0] + ' Stock Price',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Ensure the chart fills its container
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function toggleDetails(company) {
    var details = document.getElementById(company + '-details');
    details.style.display = details.style.display === 'block' ? 'none' : 'block';
}

function updateTotalAmount(company, price) {
    var quantity = document.getElementById(company + '-quantity').value;
    var totalAmount = quantity * price;
    document.getElementById(company + '-total').innerText = 'Total: ₹' + totalAmount.toFixed(2);
}

function buyStock(company, price) {
    var quantity = document.getElementById(company + '-quantity').value;
    var totalAmount = quantity * price;
    alert('Buying ' + quantity + ' shares of ' + company + ' for ₹' + totalAmount.toFixed(2));
}

function sellStock(company, price) {
    var quantity = document.getElementById(company + '-quantity').value;
    var totalAmount = quantity * price;
    alert('Selling ' + quantity + ' shares of ' + company + ' for ₹' + totalAmount.toFixed(2));
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timerElement.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateTimer, 1000); // Update the timer every second
updateTimer(); // Initialize the timer immediately

function toggleUserDetailsPanel() {
    var panel = document.getElementById("userDetailsPanel");
    panel.classList.toggle("show");
}
document.addEventListener('DOMContentLoaded', function () {
createChart('TCS-chart', [3100, 3150, 3200, 3250, 3200], 'TCS-details');
createChart('Infosys-chart', [1400, 1420, 1444.3, 1450, 1440], 'Infosys-details');
createChart('HCLTech-chart', [1300, 1310, 1339.2, 1350, 1340], 'HCLTech-details');
});