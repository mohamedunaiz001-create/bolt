import { db, collection, getDocs, doc, setDoc, getDoc } from "../src/lib/firebase";

async function testFirestore() {
  console.log("Testing Firestore connectivity...");
  try {
    const testDoc = doc(db, "test_collection", "ping");
    await setDoc(testDoc, { ping: true, time: new Date().toISOString() });
    console.log("✅ Write to test_collection succeeded!");
  } catch (e: any) {
    console.log("❌ Write failed:", e.message);
  }

  // Test reading users
  try {
    const userSnap = await getDoc(doc(db, "users", "test_user"));
    console.log("✅ Read users succeeded! Exists:", userSnap.exists());
  } catch (e: any) {
    console.log("❌ Read users failed:", e.message);
  }

  // Test reading current_affairs
  try {
    const snap = await getDocs(collection(db, "current_affairs"));
    console.log("✅ Read current_affairs succeeded! Size:", snap.size);
  } catch (e: any) {
    console.log("❌ Read current_affairs failed:", e.message);
  }

  // Test reading knowledge_nodes
  try {
    const snap = await getDocs(collection(db, "knowledge_nodes"));
    console.log("✅ Read knowledge_nodes succeeded! Size:", snap.size);
  } catch (e: any) {
    console.log("❌ Read knowledge_nodes failed:", e.message);
  }
}

testFirestore().then(() => process.exit(0));
