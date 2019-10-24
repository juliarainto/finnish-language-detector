// Made with Vanilla, so can't use NODE_ENV
const development = false;

async function getToken() {
  const response = await fetch("https://koodihaaste-api.solidabis.com/secret");
  return await response.json();
}

async function getBullshits(token, URL) {
  const response = await fetch(
    development
      ? `http://localhost:4000?url=${URL}&token=${token}`
      : `https://koodihaaste-api.solidabis.com/bullshit/`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return await response.json();
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

    for (const sentence of fetchedData.bullshits) {
      shiftSentenceByOne(sentence);
    }
  } catch (error) {
    console.trace("Error:", error);
  }
}

function sentenceHasFinnishWords(decryptedSentence) {
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
  for (const word of decryptedSentence) {
    wordEndings.forEach(element => {
      if (word.endsWith(element)) {
        possibleFinWords.push(word);
      }
    });
  }
  // Turning the first letter of the sentence to upper case.
  decryptedSentence[0] =
    decryptedSentence[0].charAt(0).toUpperCase() +
    decryptedSentence[0].slice(1);

  const sentence = decryptedSentence.join(" ");
  const wordsInSentence = decryptedSentence.length;
  const percentageOfFinnishWords =
    (possibleFinWords.length / wordsInSentence) * 100;

  // If Sentence has finnish words more than 60%. It is a Finnish sentence.
  if (percentageOfFinnishWords > 60) {
    const finnishSentences = document.getElementById("finnish");
    finnishSentences.innerHTML += `<li class="list-style"><div>${sentence +
      " "}</div><div>Finnish words found (estimate): ${percentageOfFinnishWords.toFixed(
      2
    ) + "%"}</div></li>`;
  } else {
    const bullshitSentences = document.getElementById("bullshit");
    bullshitSentences.innerHTML += `<li class="list-style"> ${sentence}</div><div>Finnish words found (estimate): ${percentageOfFinnishWords.toFixed(
      2
    ) + "%"}</div></li>`;
  }
  console.log(sentence);
}

function shiftSentenceByOne(sentence) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzåäö".split("");
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
  sentenceHasFinnishWords(decryptedWords);
}

// Run main function

main();
