async function getToken() {
  const response = await fetch("https://koodihaaste-api.solidabis.com/secret");
  return await response.json();
}

async function getBullshits(token, URL) {
  const response = await fetch(
    `http://localhost:4000?url=${URL}&token=${token}`
  );
  return await response.json();
}

function checkSentence() {
  const textInput = document.getElementById("guess-sentence");
  const checkedWords = calculateFinnishWords(textInput.value.split(" "));
  howFinnishIsThis(checkedWords);
}

async function main() {
  try {
    const fetchToken = await getToken();
    if (!fetchToken.jwtToken) {
      throw fetchToken.message;
    }
    const fetchedData = await getBullshits(
      fetchToken.jwtToken,
      fetchToken.bullshitUrl
    );

    if (!fetchedData.success) {
      throw fetchedData.message;
    }

    const decrypted = decryptSentences(fetchedData.bullshits);
    const percentageFinnishWords = [];
    for (const sentenceOfDecrypted of decrypted) {
      const calculatedPercentage = calculateFinnishWords(sentenceOfDecrypted);
      percentageFinnishWords.push(calculatedPercentage);
    }

    const sorted = sortSentences(percentageFinnishWords);
    for (const readySentence of sorted) {
      appendSentencesToUI(readySentence);
    }
  } catch (error) {
    console.trace("Error:", error);
  }
}

function calculateFinnishWords(sentenceOfDecrypted) {
  // Finnish inflected forms
  const wordEndings = [
    "en",
    "lle",
    "lla",
    "llä",
    "ssa",
    "ssä",
    "sta",
    "stä",
    "sä",
    "sa",
    "tä",
    "nä",
    "ta",
    "na",
    "ja",
    "nen",
    "me",
    "ne",
    "te",
    "een",
    "ni",
    "si",
    "kö",
    "ko",
    "kkö",
    "kko",
    "kin",
    "kään",
    "kökin",
    "aan",
    "ksi",
    "iin",
    "rin",
    "neet"
  ];

  const possibleFinWords = [];

  for (const wordOfDecryptedSentence of sentenceOfDecrypted) {
    wordEndings.forEach(element => {
      if (wordOfDecryptedSentence.endsWith(element)) {
        possibleFinWords.push(wordOfDecryptedSentence);
      }
    });
  }

  // Turning the first letter of the sentence to upper case.
  sentenceOfDecrypted[0] = sentenceOfDecrypted[0].charAt(0).toUpperCase() + sentenceOfDecrypted[0].slice(1);

  const wordsInSentence = sentenceOfDecrypted.length;
  const percentageOfFinnishWords =
    (possibleFinWords.length / wordsInSentence) * 100;

  return { sentence: sentenceOfDecrypted.join(" "), percentage: percentageOfFinnishWords };
}

function sortSentences(sentences) {
  
  return sentences.sort((a, b) => (a.percentage > b.percentage) ? -1 : 1);
}

function appendSentencesToUI(readySentence) {
  // If Sentence has finnish words more than 60%. It is a Finnish sentence.
  if (readySentence.percentage > 60) {
    const finnishSentences = document.getElementById("finnish");
    finnishSentences.innerHTML += `<li class="list-style"><div>${readySentence.sentence} </div><div>Recognized Finnish words: ${readySentence.percentage.toFixed(
      2
    )}%</div></li>`;
  } else {
    const bullshitSentences = document.getElementById("bullshit");
    bullshitSentences.innerHTML += `<li class="list-style"> ${readySentence.sentence} </div><div>Recognized Finnish words: ${readySentence.percentage.toFixed(
      2
    )}%</div></li>`;
  }
}

function howFinnishIsThis(inputSentence) {
  // If Sentence has finnish words more than 60%. It is a Finnish sentence.
  if (inputSentence.percentage > 60) {
    const finnishSentences = document.getElementById("result");
    finnishSentences.innerHTML = `<div class="very-finnish">Very Finnish! ${inputSentence.percentage.toFixed(
      2
    )}%</div>`;
  } else if(inputSentence.percentage > 40){
    const finnishSentences = document.getElementById("result");
    finnishSentences.innerHTML = `<div class="not-sure-finnish">Not sure if Finnish! ${inputSentence.percentage.toFixed(
      2
    )}%</div>`;
  } else {
    const finnishSentences = document.getElementById("result");
    finnishSentences.innerHTML = `<div class="not-finnish">Not Finnish! ${inputSentence.percentage.toFixed(
      2
    )}%</div>`;
  }
}

function decryptSentences(bullshits) {
  const decryptedSentences = [];
  const alphabet = "abcdefghijklmnopqrstuvwxyzåäö".split("");
  for (const sentence of bullshits) {
    const decryptedWords = [];
    const words = sentence.message.split(" ");
    for (const word of words) {
      let decryptedWord = "";
      for (const letter of word) {
        let index = alphabet.indexOf(letter.toLowerCase());
        // if index is the last alphabet, rotate to start
        if (index >= alphabet.length - 1) {
          index = 0;
          // If the letter is not found from alphabets, add it as it is.
        } else if (index < 0) {
          decryptedWord += letter;
          // Else shift index (word) by one
        } else {
          index = index + 1;
        }
        if (alphabet[index]) {
          decryptedWord += alphabet[index];
        }
      }
      decryptedWords.push(decryptedWord);
    }
    decryptedSentences.push(decryptedWords);
  }
  return decryptedSentences;
}

// Run main function

main();
