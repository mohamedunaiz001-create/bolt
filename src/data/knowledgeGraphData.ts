/**
 * UPSC Bolt Curriculum Knowledge Graph
 * 
 * NOTE: Hardcoded mock data (GRAPH_NODES, GRAPH_EDGES, THEMATIC_CLUSTERS)
 * has been migrated to Firestore and dynamic database storage (data/knowledge_graph_store.json).
 * 
 * Real-time data is now fetched asynchronously via:
 * - Firestore collections ('knowledge_nodes', 'knowledge_edges', 'knowledge_clusters')
 * - Full-stack API: /api/curriculum/knowledge-graph
 */

export type { ThematicCluster } from "../types";

// Empty defaults for backward compatibility
export const GRAPH_NODES = [];
export const GRAPH_EDGES = [];
export const THEMATIC_CLUSTERS = [];
