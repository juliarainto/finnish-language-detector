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
  console.log(decryptedWords);
}

// Run main function

main();
