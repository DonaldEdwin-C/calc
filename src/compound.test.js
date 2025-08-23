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
})