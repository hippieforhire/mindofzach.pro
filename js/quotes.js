const quotes = [
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "Do what you can, with what you have, where you are.",
    "Hardships often prepare ordinary people for an extraordinary destiny."
    "Chickens are quite often the only smart things in your home"
    "
];

function displayRandomQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById("quote").textContent = randomQuote;
}
