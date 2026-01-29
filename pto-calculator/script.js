document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const currentPtoInput = document.getElementById('currentPto');
    const accrualRateInput = document.getElementById('accrualRate');
    const targetDateInput = document.getElementById('targetDate');
    const calculateBtn = document.getElementById('calculateBtn');
    const estimatedPtoSpan = document.getElementById('estimatedPto');
    const payPeriodsInfo = document.getElementById('payPeriodsInfo');

    // Theme switcher logic
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    const setTheme = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.checked = false;
            localStorage.setItem('theme', 'light');
        }
    };

    if (savedTheme === 'dark' || (savedTheme === null && userPrefersDark)) {
        setTheme(true);
    } else {
        setTheme(false);
    }

    themeToggle.addEventListener('change', () => {
        setTheme(themeToggle.checked);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === null) {
            setTheme(e.matches);
        }
    });


    // Set default target date to 3 months from now
    const today = new Date();
    const threeMonthsLater = new Date(today.setMonth(today.getMonth() + 3));
    targetDateInput.value = threeMonthsLater.toISOString().split('T')[0];

    calculateBtn.addEventListener('click', calculatePto);

    function calculatePto() {
        const currentPto = parseFloat(currentPtoInput.value);
        const accrualRate = parseFloat(accrualRateInput.value);
        const targetDateStr = targetDateInput.value;

        if (isNaN(currentPto) || isNaN(accrualRate) || !targetDateStr) {
            alert('Please enter valid numbers for PTO and select a target date.');
            return;
        }

        const startDate = new Date();
        const targetDate = new Date(targetDateStr);

        // Ensure target date is not in the past
        if (targetDate < startDate) {
            alert('Target date cannot be in the past.');
            estimatedPtoSpan.textContent = '0';
            payPeriodsInfo.textContent = '';
            return;
        }
        
        // Refined pay period calculation
        const todayDay = startDate.getDay(); // 0 = Sunday, 5 = Friday
        let firstPayday = new Date(startDate);

        // Find the most recent pay-Friday. Paydays are every other Friday.
        // Let's assume one of the recent Fridays was a payday to establish a cycle.
        // A robust solution would need a known payday. Let's assume a "reference" payday.
        // For this example, let's establish a cycle based on a known recent payday, e.g., Jan 5, 2024.
        const referencePayday = new Date('2024-01-05T00:00:00'); 
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysSinceReference = Math.floor((startDate - referencePayday) / msPerDay);
        const weekDifference = Math.floor(daysSinceReference / 7);

        let nextPayDate;

        if (weekDifference % 2 === 0) { // We are in a "pay week" cycle
            // Find the upcoming Friday of this week
            firstPayday.setDate(startDate.getDate() - todayDay + 5);
        } else { // We are in an "off week" cycle
            // Find the Friday of next week
            firstPayday.setDate(startDate.getDate() - todayDay + 12);
        }

        // If the calculated first payday is in the past, move to the next pay cycle
        if (firstPayday < startDate) {
            firstPayday.setDate(firstPayday.getDate() + 14);
        }

        let actualPayPeriods = 0;
        let currentPayDate = new Date(firstPayday);

        while (currentPayDate <= targetDate) {
            actualPayPeriods++;
            currentPayDate.setDate(currentPayDate.getDate() + 14); // Move to the next payday
        }
        
        const accruedPto = actualPayPeriods * accrualRate;
        const totalPto = currentPto + accruedPto;

        estimatedPtoSpan.textContent = totalPto.toFixed(2);
        payPeriodsInfo.textContent = `(Accruing over ${actualPayPeriods} pay periods)`;
    }

    // Initial calculation on page load
    calculatePto();
});
