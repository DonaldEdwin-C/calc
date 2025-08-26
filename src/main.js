export class BaseFundCalculator {
  constructor(baseUrl, fundName) {
    this.baseUrl = baseUrl;
    this.fundName = fundName;
    this.taxRate = 0.15;
    this.dailyYieldRate = 0.00058;
    this.minDeposit = 0; // overridden in subclasses
  }

  async fetchRate() {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/client-unitization/show-unit-funds/17`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok)
      //   throw new Error(`Error ${response.status}: ${response.statusText}`);
      // const funds = await response.json();

      // // find this fund by name
      // const fund = funds.find((f) => f.name === this.fundName);
      // if (!fund) throw new Error(`Fund "${this.fundName}" not found in API`);

      // const annualPercent = fund.net_daily_yield;
      // const annualDecimal = annualPercent / 100;
      // this.dailyYieldRate = Math.pow(1 + annualDecimal, 1 / 360) - 1;
       this.dailyYieldRate = 0.13/ 365;

      return fund;
    } catch (err) {
      console.error("Failed to fetch rate:", err.message);
      return null;
    }
  }

  calculate(amount, months = 1) {
    if (amount < this.minDeposit) {
      return {
        error: `Minimum deposit for ${this.fundName} is KES ${this.minDeposit}`,
      };
    }
    if (this.dailyYieldRate === null) {
      return { error: "Rate not loaded yet. Call fetchRate() first." };
    }
    if (months < 0) {
      return { error: "Months cannot be negative" };
    }
    if (months === 0) {
      return {
        fundName: this.fundName,
        investedAmount: amount,
        months: 0,
        days: 0,
        finalBalance: amount,
        netReturn: 0,
      };
    }

    const days = months * 30;
    let balance = amount;
    let totalTax = 0;
    for (let day = 1; day <= days; day++) {
      const gross = balance * this.dailyYieldRate;
      const tax = gross * this.taxRate;
      const net = gross - tax;
      balance += net;
      totalTax += tax;


      // subtract ledger fee if applicable
      balance -= this.applyLedgerFee(day);
    }

    return {
      fundName: this.fundName,
      investedAmount: amount,
      months,
      days,
      finalBalance: balance,
      netReturn: balance - amount,
      totalTax
    };
  }

  // Default: no fees
  applyLedgerFee(day) {
    return 0;
  }
}

// CMMF: min 100, ledger fee 50 each month after 6 months
export class CMMFCalculator extends BaseFundCalculator {
  constructor(baseUrl) {
    super(baseUrl, "CMMF"); // must match API fund name
    this.minDeposit = 100;
  }

  applyLedgerFee(day) {
    const month = Math.floor(day / 30); // completed months
    // Apply ledger fee monthly starting from month 7
    if (month >= 7 && day % 30 === 0) {
      return 50;
    }
    return 0;
  }
}

// Cytonn High Yield Fund: min 100,000, no fees
export class CHYFCalculator extends BaseFundCalculator {
  constructor(baseUrl) {
    super(baseUrl, "Cytonn High Yield Fund"); // must match API fund name
    this.minDeposit = 100000;
  }
}

window.CMMFCalculator = CMMFCalculator;
window.CHYFCalculator = CHYFCalculator;
