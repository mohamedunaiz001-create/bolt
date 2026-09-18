/**
 * UPSC Curriculum & State Repository (Re-export from upscData)
 * All mock data has been completely eliminated in favor of genuine UPSC curriculum
 * and dynamic live news / evaluation pipelines.
 */
export * from "./upscData";
import { NewsArticle, MainsAnswerEvaluation } from "../types";

// Clean empty collections - all data is loaded dynamically from backend pipelines or user input
export const mockNewsArticles: NewsArticle[] = [];
export const sampleEvaluation: MainsAnswerEvaluation | null = null;
