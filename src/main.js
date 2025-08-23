import './style.css'

  export function calculateInterest() {
      let P = parseFloat(document.getElementById('principal').value);
      let M = parseInt(document.getElementById('months').value);
      let annualRate = 13; // 13% per annum
      let daysInYear = 365;

      if (isNaN(P) || isNaN(M)) {
        document.getElementById('output').innerHTML = "⚠️ Please enter valid values.";
        return;
      }

      // Convert months to days (approx 30 days per month)
      let T = M * 30;

      // Daily interest rate
      let dailyRate = annualRate / (100 * daysInYear);

      // Gross interest
      let grossInterest = P * dailyRate * T;

      // Withholding tax 15%
      let wht = 0.15 * grossInterest;
      let netInterest = grossInterest - wht;

      // Ledger charge: 50 per month if ≥ 6 months
      let ledgerCharge = (M > 6) ? ((M-6)*50) : 0;

      // Final total balance
      let totalAmount = P + netInterest - ledgerCharge;

      document.getElementById('output').innerHTML = `
      Ksh ${totalAmount.toFixed(2)}
      `; 
    }

// document.getElementById('calculate').addEventListener('click',calculateInterest)

// cytonn high yield fund

class chyf{
  constructor(principal, time){
    this.principal = principal;
    this.rate = 21.905 / (100 * 364);
    this.time = time * 30
  }

// method formula
calculateFutureValue(){
    return this.principal * Math.pow(1 + this.rate, this.time);
}


}
let yields = new chyf(10000, 10);
console.log(yields.calculateFutureValue())

