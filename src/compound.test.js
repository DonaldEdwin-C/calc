import { describe, it, expect, beforeEach, toContain } from "vitest";
import { calculateInterest } from "./main.js"

describe ("calculateInterest (DOM-based)", () => {
 
beforeEach(() => {
    document.body.innerHTML = `
      <input id="principal" />
      <input id="months" />
      <div id="output"></div>
      <button id="calculate"></button>
    `;
  });


    it("Should show error message for invalid input", () => {
        document.getElementById('principal').value = "";
        document.getElementById('months').value = "";

        calculateInterest();
        expect(document.getElementById('output').innerHTML).toContain('⚠️ Please enter valid values.');
    });

    
    it("should calculate correct interest for 3 months", () => {
    document.getElementById("principal").value = "10000";
    document.getElementById("months").value = "3";

    calculateInterest();

    const output = document.getElementById("output").innerHTML;
    expect(output).toContain("Ksh"); // has prefix
    expect(parseFloat(output.replace("Ksh", ""))).toBeGreaterThan(10000); // should increase
  });



  it("should handle edge case: 0 months", () => {
    document.getElementById("principal").value = "5000";
    document.getElementById("months").value = "0";

    calculateInterest();

    const output = document.getElementById("output").innerHTML;
    const total = parseFloat(output.replace("Ksh", ""));
    expect(total).toBeCloseTo(5000, 2); // No interest, no charges
  });


})