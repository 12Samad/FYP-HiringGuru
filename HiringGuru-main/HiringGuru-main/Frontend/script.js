const words = ["Interview Skills", "Confidence", "Communication", "Body Language", "Real-Time Feedback"];
let wordIndex = 0;
let letterIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const erasingSpeed = 50;
const delayBetweenWords = 1000; // delay before switching to the next word

function typeEffect() {
    const dynamicText = document.getElementById('dynamic-text');

    if (letterIndex < words[wordIndex].length && !isDeleting) {
        // Typing effect
        dynamicText.textContent += words[wordIndex][letterIndex];
        letterIndex++;
        setTimeout(typeEffect, typingSpeed);
    } else if (isDeleting && letterIndex > 0) {
        // Deleting effect
        dynamicText.textContent = words[wordIndex].substring(0, letterIndex - 1);
        letterIndex--;
        setTimeout(typeEffect, erasingSpeed);
    } else if (!isDeleting && letterIndex === words[wordIndex].length) {
        // Pause before deleting
        isDeleting = true;
        setTimeout(typeEffect, delayBetweenWords);
    } else if (isDeleting && letterIndex === 0) {
        // Move to the next word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(typeEffect, typingSpeed);
    }
}

document.addEventListener("DOMContentLoaded", typeEffect);
