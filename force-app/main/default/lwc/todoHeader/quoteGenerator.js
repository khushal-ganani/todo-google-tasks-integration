export default class QouteGenerator {
    constructor(){
        this.quotes = [
            "Make each day your masterpiece.",
            "Your future is created by what you do today, not tomorrow.",
            "Don't watch the clock; do what it does. Keep going.",
            "Believe you can and you're halfway there.",
            "The only way to do great work is to love what you do.",
            "Success is not final, failure is not fatal: It is the courage to continue that counts.",
            "The only limit to our realization of tomorrow will be our doubts of today.",
            "The best way to predict the future is to create it.",
            "Do not wait to strike till the iron is hot, but make it hot by striking.",
            "I find that the harder I work, the more luck I seem to have.",
            "It is during our darkest moments that we must focus to see the light.",
            "The only place where success comes before work is in the dictionary.",
            "Your time is limited, don't waste it living someone else's life.",
            "The road to success and the road to failure are almost exactly the same.",
            "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart."
        ];
    }

    getRandomQuote(){
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        return this.quotes[randomIndex];
    }
}