/**
 * Script to migrate static Knowledge Graph data into Firestore.
 * Run using: npx tsx scripts/seed-knowledge-graph.ts
 */
import { db, auth, signInAnonymously, doc, setDoc, getDocs, collection, serverTimestamp } from "../src/lib/firebase";
import { GRAPH_NODES, GRAPH_EDGES, THEMATIC_CLUSTERS } from "../src/data/knowledgeGraphData";

async function seedKnowledgeGraph() {
  console.log("🔑 Authenticating anonymously...");
  try {
    const cred = await signInAnonymously(auth);
    console.log(`✅ Authenticated with UID: ${cred.user.uid}`);
  } catch (authErr) {
    console.warn("⚠️ Anonymous auth failed, attempting with unauthenticated:", authErr);
  }

  console.log("🌱 Migrating Knowledge Graph dataset to Firestore...");
  console.log(`📦 Nodes: ${GRAPH_NODES.length}, Edges: ${GRAPH_EDGES.length}, Clusters: ${THEMATIC_CLUSTERS.length}`);

  try {
    // 1. Seed Nodes
    console.log("Saving nodes to 'knowledge_nodes' collection...");
    for (const node of GRAPH_NODES) {
      const nodeRef = doc(db, "knowledge_nodes", node.id);
      await setDoc(nodeRef, {
        ...node,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    console.log("✅ All nodes saved.");

    // 2. Seed Edges
    console.log("Saving edges to 'knowledge_edges' collection...");
    for (const edge of GRAPH_EDGES) {
      const edgeRef = doc(db, "knowledge_edges", edge.id);
      await setDoc(edgeRef, {
        ...edge,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    console.log("✅ All edges saved.");

    // 3. Seed Clusters
    console.log("Saving thematic clusters to 'knowledge_clusters' collection...");
    for (const cluster of THEMATIC_CLUSTERS) {
      const clusterRef = doc(db, "knowledge_clusters", cluster.id);
      await setDoc(clusterRef, {
        ...cluster,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    console.log("✅ All clusters saved.");

    // Verify
    const nodesSnap = await getDocs(collection(db, "knowledge_nodes"));
    const edgesSnap = await getDocs(collection(db, "knowledge_edges"));
    const clustersSnap = await getDocs(collection(db, "knowledge_clusters"));
    console.log(`🎉 Migration verified in Firestore:`);
    console.log(`   - Nodes in Firestore: ${nodesSnap.size}`);
    console.log(`   - Edges in Firestore: ${edgesSnap.size}`);
    console.log(`   - Clusters in Firestore: ${clustersSnap.size}`);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

seedKnowledgeGraph().then(() => {
  console.log("Done.");
  process.exit(0);
});
