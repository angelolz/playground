document.addEventListener('DOMContentLoaded', () => {
    const currentPtoInput = document.getElementById('currentPto');
    const accrualRateInput = document.getElementById('accrualRate');
    const targetDateInput = document.getElementById('targetDate');
    const calculateBtn = document.getElementById('calculateBtn');
    const estimatedPtoSpan = document.getElementById('estimatedPto');
    const payPeriodsInfo = document.getElementById('payPeriodsInfo');

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

        let payPeriods = 0;
        let currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow to count future pay periods

        while (currentDate <= targetDate) {
            // Check if it's a Friday
            if (currentDate.getDay() === 5) { // Friday is 5
                payPeriods++;
            }
            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }
        
        // Adjust for bi-weekly pay periods
        // Since we counted every Friday, we need to divide by 2 for bi-weekly periods
        // If today is a Friday and before a hypothetical next pay period, it might count today's pay period.
        // Let's refine the pay period calculation:
        // Find the next upcoming Friday pay date from today.
        const todayDay = startDate.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
        let daysUntilNextPayFriday = 0;

        if (todayDay <= 5) { // If today is Sun, Mon, Tue, Wed, Thu, Fri
            daysUntilNextPayFriday = 5 - todayDay;
        } else { // If today is Saturday
            daysUntilNextPayFriday = 6; // To next Friday
        }

        let nextPayDate = new Date(startDate);
        nextPayDate.setDate(startDate.getDate() + daysUntilNextPayFriday);

        if (nextPayDate < startDate) { // If today is Friday and a pay period passed
             nextPayDate.setDate(nextPayDate.getDate() + 14); // Next pay period is 2 weeks later
        }

        let actualPayPeriods = 0;
        // Move nextPayDate to the first upcoming pay period that is after startDate
        // and on or before targetDate
        while (nextPayDate <= targetDate) {
            actualPayPeriods++;
            nextPayDate.setDate(nextPayDate.getDate() + 14); // Next bi-weekly pay period
        }
        
        const accruedPto = actualPayPeriods * accrualRate;
        const totalPto = currentPto + accruedPto;

        estimatedPtoSpan.textContent = totalPto.toFixed(2);
        payPeriodsInfo.textContent = `(Accruing over ${actualPayPeriods} pay periods)`;
    }

    // Initial calculation on page load
    calculatePto();
});
