"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryBingSearchAPI = exports.generateChatCompletion = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
const https = __importStar(require("https"));
(0, dotenv_1.config)(); // Load environment variables from .env file
const GPT_API_KEY = process.env.GPT_API_KEY;
const BING_API_KEY = process.env.BING_API_KEY;
const GPT_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
// This function sends a chat completion request to the GPT API.
// It takes messages, model, temperature, and maxTokens as input parameters.
async function generateChatCompletion(messages, model = "gpt-3.5-turbo", temperature = 0.7, maxTokens = null) {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GPT_API_KEY}`,
    };
    const data = {
        model,
        messages,
        temperature,
    };
    if (maxTokens !== null) {
        data.max_tokens = maxTokens;
    }
    try {
        const response = await axios_1.default.post(GPT_API_ENDPOINT, data, { headers });
        return response.data.choices[0].message.content;
    }
    catch (error) {
        console.error(error.response || error); // Log the full error response
        throw new Error(`Error ${error.response.status}: ${error.response.statusText}`);
    }
}
exports.generateChatCompletion = generateChatCompletion;
// This function queries the Bing Search API for a given searchTerm and returns the search results.
// apiClients.js
async function queryBingSearchAPI(searchTerm) {
    const SUBSCRIPTION_KEY = BING_API_KEY;
    if (!SUBSCRIPTION_KEY) {
        throw new Error("BING_API_KEY is not set.");
    }
    return new Promise((resolve, reject) => {
        https.get({
            hostname: "api.bing.microsoft.com",
            path: "/v7.0/search?q=" +
                encodeURIComponent(searchTerm) +
                "&freshness=Month",
            headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY },
        }, (res) => {
            let body = "";
            res.on("data", (part) => (body += part));
            res.on("end", () => {
                const result = JSON.parse(body);
                if (result.webPages && result.webPages.value) {
                    resolve(result.webPages.value);
                }
                else {
                    console.error("Unexpected API response:", result);
                    reject(new Error("Unexpected API response"));
                }
            });
            res.on("error", (e) => {
                console.error("Error:", e.message);
                reject(e);
            });
        });
    });
}
exports.queryBingSearchAPI = queryBingSearchAPI;
