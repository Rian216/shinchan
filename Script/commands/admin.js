// admin.js
import axios from "axios";
import "dotenv/config";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GRAPH_API = `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

// ✅ তোমার Admin ID (নিজের Facebook PSID বসাও)
const ADMIN_ID = process.env.ADMIN_ID;

// ✅ Admin Command হ্যান্ডলার
export async function handleAdminCommands(senderId, userMessage) {
  if (senderId !== ADMIN_ID) {
    return null; // Admin না হলে কিছু করবে না
  }

  let reply = null;

  if (userMessage.startsWith("/broadcast ")) {
    const text = userMessage.replace("/broadcast ", "");
    await broadcastMessage(text);
    reply = `✅ Broadcast পাঠানো হয়েছে: "${text}"`;
  } else if (userMessage === "/status") {
    reply = "🤖 Bot চলছে একদম ঠিকঠাক!";
  } else if (userMessage === "/help") {
    reply = "🔧 Admin Commands:\n/status → বটের অবস্থা\n/broadcast <text> → সবাইকে মেসেজ";
  }

  return reply;
}

// ✅ Broadcast Function (সব ইউজারকে মেসেজ পাঠাবে)
async function broadcastMessage(text) {
  // 👉 এখানে সাধারণত ইউজারের লিস্ট DB থেকে নিতে হয়।
  // আমি ডেমোর জন্য কিছু ডামি ইউজার আইডি ব্যবহার করেছি।
  const users = [ADMIN_ID]; // এখন শুধু admin কেই মেসেজ যাবে

  for (const uid of users) {
    try {
      await axios.post(GRAPH_API, {
        recipient: { id: uid },
        message: { text },
      });
      console.log(`📢 Broadcast sent to ${uid}`);
    } catch (err) {
      console.error("❌ Broadcast error:", err.response?.data || err.message);
    }
  }
}
