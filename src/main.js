class BaseFundCalculator {
  //baseUrl, fundName
  constructor() {
    this.baseUrl = null;
    this.fundName = null;
    this.taxRate = 0.15;
    this.dailyYieldRate = null;
    this.minDeposit = 0;

    this.init();
    this.funds = {
      CMMF: {
        name: "CMMF",
        rate: 0.0285,
        minimumBalance: 100,
        displayRate: "13% Annually",
      },
      CHYF: {
        name: "CHYF",
        rate: 0.0425,
        minimumBalance: 100000,
        displayRate: "21% Annually",
      },
    };
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Fund selection
    document.querySelectorAll(".fund-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const fundType = e.currentTarget.dataset.fund;
        this.selectFund(fundType);
      });
    });

    // Form submission
    const form = document.getElementById("calculatorForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.calculate();
    });

    // Input validation
    document.getElementById("amount").addEventListener("input", (e) => {
      this.validateAmount(e.target);
    });

    document.getElementById("timeframe").addEventListener("input", (e) => {
      this.validateTimeframe(e.target);
    });
  }

  selectFund(fundType) {
    if (!this.funds[fundType]) {
      this.showError("Invalid fund selection.");
      return;
    }

    // Update selected fund
    this.selectedFund = fundType;

    // Update UI
    document.querySelectorAll(".fund-card").forEach((card) => {
      card.classList.remove("selected");
    });
    document
      .querySelector(`[data-fund="${fundType}"]`)
      .classList.add("selected");

    // Update fund info
    const fund = this.funds[fundType];
    document.querySelector(".fund-name").textContent = fund.name;
    document.querySelector(".fund-rate").textContent = fund.displayRate;

    // Hide results when fund changes
    document.getElementById("resultsContainer").style.display = "none";
  }

  validateAmount(input) {
    const amount = parseFloat(input.value);
    console.log("amount here", amount);
    const errorElement = document.getElementById("amountError");
    console.log(errorElement);

    this.clearError(input, errorElement);

    if (input.value && (isNaN(amount) || amount <= 0)) {
      console.log("should be true");
      this.showFieldError(
        input,
        errorElement,
        "Please enter a valid amount greater than 0."
      );
      return false;
    }

    if (
      this.selectedFund &&
      amount &&
      amount < this.funds[this.selectedFund].minimumBalance
    ) {
      this.showFieldError(
        input,
        errorElement,
        `Minimum investment for this fund is  ${this.funds[
          this.selectedFund
        ].minimumBalance.toLocaleString()}.`
      );
      return false;
    }

    return true;
  }
  validateTimeframe(input) {
    const timeframe = parseFloat(input.value);
    const errorElement = document.getElementById("timeframeError");

    this.clearError(input, errorElement);

    if (input.value && (isNaN(timeframe) || timeframe <= 0)) {
      this.showFieldError(
        input,
        errorElement,
        "Please enter a valid time period greater than 0."
      );
      return false;
    }

    return true;
  }
  clearError(input, errorElement) {
    input.classList.remove("error");
    errorElement.textContent = "";
    errorElement.classList.remove("show");
  }
  showFieldError(input, errorElement, message) {
    input.classList.add("error");
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }

  async fetchRate(fundName) {
    try {
      const data = await fetch(`http://localhost:3000/rate?type=${fundName}`);

      let res = await data.json()
      console.log(res)

      
        //   throw new Error(`Error ${response.status}: ${response.statusText}`);
        // const funds = await response.json();

        // // find this fund by name
        // const fund = funds.find((f) => f.name === this.fundName);
        // if (!fund) throw new Error(`Fund "${this.fundName}" not found in API`);

        // const annualPercent = fund.net_daily_yield;
        // const annualDecimal = annualPercent / 100;
        // this.dailyYieldRate = Math.pow(1 + annualDecimal, 1 / 360) - 1;
        this.dailyYieldRate = res.net_daily_yield / 36500;

      return res
    } catch (err) {
      console.error("Failed to fetch rate:", err.message);
      return null;
    }
  }

  async calculate(months = 1) {
    //   if (!this.selectedFund) {
    //             this.showError('Please select a fund before calculating returns.');
    //             return;
    //         }

    const amountInput = document.getElementById("amount");
    const timeframeInput = document.getElementById("timeframe");

    if (
      !this.validateAmount(amountInput) ||
      !this.validateTimeframe(timeframeInput)
    ) {
      return;
    }

    const amount = parseFloat(amountInput.value);
    const timeframe = parseFloat(timeframeInput.value);

    if (!amountInput || !timeframe) {
      this.showError("Please enter both investment amount and time period.");
      return;
    }

    const fund = this.funds[this.selectedFund];
    // console.log('lets see the selected fund',)
    console.log(fund.name) 
    if (amountInput < this.minDeposit) {
      return {
        error: `Minimum deposit for ${this.fundName} is KES ${this.minDeposit}`,
      };
    }

    let fundResults = await this.fetchRate(fund.name)
    // console.log("fundResults", fundResults)

    if (this.dailyYieldRate === null) {
      return { error: "Rate not loaded yet. Call fetchRate() first." };
    }
    if (timeframe < 0) {
      return { error: "Months cannot be negative" };
    }
    if (timeframe === 0) {
      return {
        fundName: this.fundName,
        investedAmount: amount,
        months: 0,
        days: 0,
        finalBalance: amount,
        netReturn: 0,
      };
    }

    const days = timeframe * 30;
    let balance = amount;

    for (let day = 1; day <= days; day++) {
      const gross = balance * this.dailyYieldRate;
      const tax = gross * this.taxRate;
      const net = gross - tax;
      balance += net;

      // subtract ledger fee if applicable
      //   balance -= this.applyLedgerFee(day);

      balance -= fund.name === "CMMF" ? applyLedgerFee(day) : 0;
    }
    console.log("data", { amount, timeframe, days, balance });
    const interestEarned = balance - amount;
    const finalBalance = balance;

    this.displayResults(amount, interestEarned, finalBalance);
    return {
      fundName: this.fundName,
      investedAmount: amount,
      months,
      days,
      finalBalance: balance,
      netReturn: balance - amount,
    };
  }
  displayResults(initialAmount, interestEarned, finalBalance) {
    //effectiveRate
    document.getElementById("initialAmount").textContent =
      this.formatCurrency(initialAmount);
    document.getElementById("interestEarned").textContent =
      this.formatCurrency(interestEarned);
    document.getElementById("finalBalance").textContent =
      this.formatCurrency(finalBalance);
    // document.getElementById('effectiveRate').textContent = `${effectiveRate.toFixed(2)}%`;

    // Show results container with animation
    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.style.display = "block";
    resultsContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Default: no fees
  //   applyLedgerFee(day) {
  //     return 0;
  //   }
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "Kes",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

function applyLedgerFee(day) {
  const month = Math.floor(day / 30); // completed months
  // Apply ledger fee monthly starting from month 7
  if (month >= 7 && day % 30 === 0) {
    return 50;
  }
  return 0;
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new BaseFundCalculator();
});

// // CMMF: min 100, ledger fee 50 each month after 6 months
// class CMMFCalculator extends BaseFundCalculator {
//   constructor(baseUrl) {
//     super(baseUrl, "CMMF"); // must match API fund name
//     this.minDeposit = 100;
//   }

//   applyLedgerFee(day) {
//     const month = Math.floor(day / 30); // completed months
//     // Apply ledger fee monthly starting from month 7
//     if (month >= 7 && day % 30 === 0) {
//       return 50;
//     }
//     return 0;
//   }
// }

// // Cytonn High Yield Fund: min 100,000, no fees
// class CHYFCalculator extends BaseFundCalculator {
//   constructor(baseUrl) {
//     super(baseUrl, "Cytonn High Yield Fund"); // must match API fund name
//     this.minDeposit = 100000;
//   }
// }

// window.CMMFCalculator = CMMFCalculator;
// window.CHYFCalculator = CHYFCalculator;
