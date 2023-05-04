class TextRank {
  // This function returns the intersection of two arrays a and b.
  intersect(a, b) {
    return a.filter((value) => b.includes(value));
  }

  // This function summarizes the input rawText based on the summaryLength parameter.
  summarizeText(rawText, summaryLength) {
    //	Check the selected length and assign it a number of sentences
    let sumLength = 0;
    if (summaryLength === "short") {
      sumLength = 3;
    } else if (summaryLength === "medium") {
      sumLength = 5;
    } else if (summaryLength === "long") {
      sumLength = 7;
    }

    // split text into sentences
    const sentences = rawText.split(/[.?!]+/);

    // create a matrix to store sentence similarity scores
    const similarityMatrix = [];
    for (let i = 0; i < sentences.length; i++) {
      similarityMatrix[i] = [];
      for (let j = 0; j < sentences.length; j++) {
        similarityMatrix[i][j] = 0;
      }
    }

    // calculate sentence similarity scores
    for (let i = 0; i < sentences.length; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        const intersection = this.intersect(
          sentences[i].split(" "),
          sentences[j].split(" ")
        );
        similarityMatrix[i][j] =
          intersection.length /
          (Math.log(sentences[i].length) + Math.log(sentences[j].length));
        similarityMatrix[j][i] = similarityMatrix[i][j];
      }
    }

    // calculate sentence scores
    const sentenceScores = [];
    for (let i = 0; i < sentences.length; i++) {
      let score = 0;
      for (let j = 0; j < sentences.length; j++) {
        if (i !== j) {
          score += similarityMatrix[i][j];
        }
      }
      sentenceScores[i] = score;
    }

    // sort sentences by score
    const sortedSentences = [];
    for (let i = 0; i < sentences.length; i++) {
      sortedSentences.push({
        sentence: sentences[i],
        score: sentenceScores[i],
      });
    }
    sortedSentences.sort((a, b) => b.score - a.score);

    // return the sentences with the highest scores
    return (
      sortedSentences
        .slice(0, sumLength)
        .map((s) => s.sentence)
        .join(". ") + "."
    );
  }
}

export { TextRank };
