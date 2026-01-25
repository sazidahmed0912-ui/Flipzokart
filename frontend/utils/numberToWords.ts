/**
 * Converts a number to words in Indian currency format.
 * Example: 21104 -> "Twenty One Thousand One Hundred Four Only"
 */
export const numberToWords = (num: number): string => {
    const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const formatTens = (n: number): string => {
        if (n < 10) return single[n];
        if (n < 20) return double[n % 10];
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + single[n % 10] : "");
    };

    if (num === 0) return "Zero";
    let str = "";

    // Handle Crores
    if (num >= 10000000) {
        str += formatTens(Math.floor(num / 10000000)) + " Crore ";
        num %= 10000000;
    }

    // Handle Lakhs
    if (num >= 100000) {
        str += formatTens(Math.floor(num / 100000)) + " Lakh ";
        num %= 100000;
    }

    // Handle Thousands
    if (num >= 1000) {
        str += formatTens(Math.floor(num / 1000)) + " Thousand ";
        num %= 1000;
    }

    // Handle Hundreds
    if (num >= 100) {
        str += formatTens(Math.floor(num / 100)) + " Hundred ";
        num %= 100;
    }

    // Handle remaining tens/ones
    if (num > 0) {
        str += (str !== "" ? "and " : "") + formatTens(num);
    }

    return str + " Only";
};
