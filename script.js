class MoneyMarketCalculator {
    constructor() {
        this.selectedFund = null;
        this.funds = {
            standard: {
                name: 'Standard Fund',
                rate: 0.0285,
                minimumBalance: 0,
                displayRate: '2.85% APY'
            },
            'high-yield': {
                name: 'High-Yield Fund',
                rate: 0.0425,
                minimumBalance: 1000,
                displayRate: '4.25% APY'
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Fund selection
        document.querySelectorAll('.fund-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const fundType = e.currentTarget.dataset.fund;
                this.selectFund(fundType);
            });
        });

        // Form submission
        const form = document.getElementById('calculatorForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateReturns();
        });

        // Input validation
        document.getElementById('amount').addEventListener('input', (e) => {
            this.validateAmount(e.target);
        });

        document.getElementById('timeframe').addEventListener('input', (e) => {
            this.validateTimeframe(e.target);
        });
    }

    selectFund(fundType) {
        if (!this.funds[fundType]) {
            this.showError('Invalid fund selection.');
            return;
        }

        // Update selected fund
        this.selectedFund = fundType;

        // Update UI
        document.querySelectorAll('.fund-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-fund="${fundType}"]`).classList.add('selected');

        // Update fund info
        const fund = this.funds[fundType];
        document.querySelector('.fund-name').textContent = fund.name;
        document.querySelector('.fund-rate').textContent = fund.displayRate;

        // Hide results when fund changes
        document.getElementById('resultsContainer').style.display = 'none';
    }

    validateAmount(input) {
        const amount = parseFloat(input.value);
        const errorElement = document.getElementById('amountError');

        this.clearError(input, errorElement);

        if (input.value && (isNaN(amount) || amount <= 0)) {
            this.showFieldError(input, errorElement, 'Please enter a valid amount greater than $0.');
            return false;
        }

        if (this.selectedFund && amount && amount < this.funds[this.selectedFund].minimumBalance) {
            this.showFieldError(input, errorElement, `Minimum investment for this fund is $${this.funds[this.selectedFund].minimumBalance.toLocaleString()}.`);
            return false;
        }

        if (amount && amount > 10000000) {
            this.showFieldError(input, errorElement, 'Maximum investment amount is $10,000,000.');
            return false;
        }

        return true;
    }

    validateTimeframe(input) {
        const timeframe = parseFloat(input.value);
        const errorElement = document.getElementById('timeframeError');

        this.clearError(input, errorElement);

        if (input.value && (isNaN(timeframe) || timeframe <= 0)) {
            this.showFieldError(input, errorElement, 'Please enter a valid time period greater than 0.');
            return false;
        }

        if (timeframe && timeframe > 50) {
            this.showFieldError(input, errorElement, 'Maximum time period is 50 years.');
            return false;
        }

        return true;
    }

    showFieldError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }

    calculateReturns() {
        if (!this.selectedFund) {
            this.showError('Please select a fund before calculating returns.');
            return;
        }

        const amountInput = document.getElementById('amount');
        const timeframeInput = document.getElementById('timeframe');
        
        if (!this.validateAmount(amountInput) || !this.validateTimeframe(timeframeInput)) {
            return;
        }

        const amount = parseFloat(amountInput.value);
        const timeframe = parseFloat(timeframeInput.value);

        if (!amount || !timeframe) {
            this.showError('Please enter both investment amount and time period.');
            return;
        }

        const fund = this.funds[this.selectedFund];
        
        // Calculate compound interest: A = P(1 + r)^t
        const finalBalance = amount * Math.pow(1 + fund.rate, timeframe);
        const interestEarned = finalBalance - amount;
        const effectiveRate = ((finalBalance / amount - 1) / timeframe) * 100;

        // Display results
        this.displayResults(amount, interestEarned, finalBalance, effectiveRate);
    }

    displayResults(initialAmount, interestEarned, finalBalance, effectiveRate) {
        document.getElementById('initialAmount').textContent = this.formatCurrency(initialAmount);
        document.getElementById('interestEarned').textContent = this.formatCurrency(interestEarned);
        document.getElementById('finalBalance').textContent = this.formatCurrency(finalBalance);
        document.getElementById('effectiveRate').textContent = `${effectiveRate.toFixed(2)}%`;

        // Show results container with animation
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type) {
        const toastId = type === 'error' ? 'errorToast' : 'successToast';
        const toast = document.getElementById(toastId);
        const messageElement = toast.querySelector('.toast-message');
        
        messageElement.textContent = message;
        toast.classList.add('show');

        // Auto-hide after 4 seconds
        setTimeout(() => {
            this.hideToast();
        }, 4000);
    }

    hideToast() {
        document.querySelectorAll('.toast').forEach(toast => {
            toast.classList.remove('show');
        });
    }
}

// Global function for toast close button
function hideToast() {
    document.querySelectorAll('.toast').forEach(toast => {
        toast.classList.remove('show');
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new MoneyMarketCalculator();
});