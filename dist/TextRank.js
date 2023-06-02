"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextRank = void 0;
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
        }
        else if (summaryLength === "medium") {
            sumLength = 5;
        }
        else if (summaryLength === "long") {
            sumLength = 7;
        }
        // split text into sentences
        const sentences = rawText.split(/[.?!]+/);
        // create a matrix to store sentence similarity scores
        const similarityMatrix = Array.from({ length: sentences.length }, () => Array(sentences.length).fill(0));
        // calculate sentence similarity scores
        for (let i = 0; i < sentences.length; i++) {
            for (let j = i + 1; j < sentences.length; j++) {
                const intersection = this.intersect(sentences[i].split(" "), sentences[j].split(" "));
                const similarityScore = intersection.length /
                    (Math.log(sentences[i].length) + Math.log(sentences[j].length));
                similarityMatrix[i][j] = similarityScore;
                similarityMatrix[j][i] = similarityScore;
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
        const sortedSentences = sentences.map((sentence, i) => ({
            sentence,
            score: sentenceScores[i],
        }));
        sortedSentences.sort((a, b) => b.score - a.score);
        // return the sentences with the highest scores
        return (sortedSentences
            .slice(0, sumLength)
            .map((s) => s.sentence)
            .join(". ") + ".");
    }
}
exports.TextRank = TextRank;
