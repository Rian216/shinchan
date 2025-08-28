import express from "express";
import axios from "axios";
import "dotenv/config";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GRAPH = `https://graph.facebook.com/${process.env.GRAPH_API_VERSION || "v20.0"}`;

app.get("/", (_, res) => res.send("OK"));

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object !== "page") return res.sendStatus(404);
  for (const entry of body.entry) {
    const event = entry.messaging?.[0];
    if (!event) continue;
    const psid = event.sender?.id;

    if (event.message?.text) {
      const text = event.message.text.trim();
      const reply =
        ["hi", "hello", "hey"].includes(text.toLowerCase())
          ? "Hi! 😄 আমি তোমার বট। কীভাবে সাহায্য করব?"
          : `তুমি বলেছো: ${text}`;
      await sendText(psid, reply);
    } else if (event.postback) {
      await sendText(psid, `তুমি ক্লিক করেছো: ${event.postback.title}`);
    }
  }
  res.sendStatus(200);
});

async function sendText(psid, text) {
  try {
    await axios.post(
      `${GRAPH}/me/messages`,
      { recipient: { id: psid }, messaging_type: "RESPONSE", message: { text } },
      { params: { access_token: PAGE_ACCESS_TOKEN } }
    );
  } catch (e) {
    console.error("Send error:", e.response?.data || e.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on ${PORT}`));
