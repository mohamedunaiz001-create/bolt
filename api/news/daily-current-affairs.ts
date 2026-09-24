import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  loadCurrentAffairsFromFirestore,
} from "../../server/currentAffairsPipeline";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const result: any = await loadCurrentAffairsFromFirestore();
    const articles = Array.isArray(result) ? result : (result?.articles ?? []);

    return res.status(200).json({
      success: true,
      articles,
      count: articles.length,
    });
  } catch (error) {
    console.error("Daily current affairs error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to load daily current affairs",
    });
  }
}
