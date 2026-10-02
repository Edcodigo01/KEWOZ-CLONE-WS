const db = require("../../models");
const { User, Chat, Participant, Message, Story, Broadcast_push_notification } = db;

const fs = require("fs");
const path = require("path");
const axios = require("axios");

/* ------------------------------------------------------- */
/* UPLOAD FOLDER */
/* ------------------------------------------------------- */

const UPLOAD_FOLDER = path.join(__dirname, "../../uploads/others");

if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

/* ------------------------------------------------------- */
/* TEXT MESSAGES */
/* ------------------------------------------------------- */

const TEXT_MESSAGES = [
  "Hey how are you?","Let's catch up soon!","Did you see that?","That's awesome!",
  "Call me when free","Good morning!","Good night!","Where are you now?",
  "Are you free today?","Let's meet tomorrow","Did you finish the task?",
  "I will call you later","Can you check this?","That sounds great","Perfect!",
  "Nice work","Send me the file","I will join in 5 minutes","Give me a moment",
  "Thanks!","Welcome!","Okay","Sure","Absolutely","No problem","Let's do it",
  "I'll handle this","Working on it","Almost done","Done!","Please review this",
  "Check your email","I just sent it","Got it","Looks good","Approved",
  "Let's start","Ready when you are","Sounds good","Interesting","That's funny",
  "Nice idea","I like it","Great job","Keep going","Fantastic","Brilliant",
  "See you soon","Talk later","Take care"
];

/* ------------------------------------------------------- */
/* DOWNLOAD HELPER                                          */
/* Returns relative path e.g. "uploads/others/xxx.jpg"    */
/* ------------------------------------------------------- */

async function downloadFile(url, filename) {
  const filePath = path.join(UPLOAD_FOLDER, filename);
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 20000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
    return `uploads/others/${filename}`;
  } catch (err) {
    console.warn(`  [seed warn] download failed for ${url}: ${err.message}`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return null;
  }
}

/* ------------------------------------------------------- */
/* IMAGE GENERATOR                                          */
/* Fixed-seed picsum URLs — stable, always resolves        */
/* ------------------------------------------------------- */

const IMAGE_SEEDS = ["aaa","bbb","ccc","ddd","eee","fff","ggg","hhh","iii","jjj"];
let imgIdx = 0;

async function generateImage() {
  const seed = IMAGE_SEEDS[imgIdx++ % IMAGE_SEEDS.length];
  const name = `${Date.now()}_${seed}_img.jpg`;
  const rel = await downloadFile(`https://picsum.photos/seed/${seed}/400/400`, name);
  return rel || "uploads/not-found-images/group-image.png";
}

/* ------------------------------------------------------- */
/* VIDEO GENERATOR                                          */
/* Multiple reliable public-domain MP4 sources             */
/* ------------------------------------------------------- */

const VIDEO_SOURCES = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
];
let vidIdx = 0;
const _videoCache = {};

async function generateVideo() {
  const url = VIDEO_SOURCES[vidIdx++ % VIDEO_SOURCES.length];
  if (_videoCache[url]) return _videoCache[url];
  const name = `${Date.now()}_video.mp4`;
  const rel = await downloadFile(url, name);
  const result = rel || "uploads/not-found-images/group-image.png";
  _videoCache[url] = result;
  return result;
}

/* ------------------------------------------------------- */
/* THUMBNAIL GENERATOR                                      */
/* Fixed-seed picsum — always a valid JPEG                 */
/* ------------------------------------------------------- */

const THUMB_SEEDS = ["t1","t2","t3","t4","t5"];
let thumbIdx = 0;

async function generateThumbnail() {
  const seed = THUMB_SEEDS[thumbIdx++ % THUMB_SEEDS.length];
  const name = `${Date.now()}_${seed}_thumb.jpg`;
  const rel = await downloadFile(`https://picsum.photos/seed/${seed}/200/200`, name);
  return rel || "uploads/not-found-images/group-image.png";
}

/* ------------------------------------------------------- */
/* DOC / PDF GENERATOR                                      */
/* ------------------------------------------------------- */

function generateDoc() {

  const name = `${Date.now()}-dummy-document.pdf`;

  const filePath = path.join(UPLOAD_FOLDER, name);

  // Minimal valid PDF so it can be opened
  const minimalPdf =
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n" +
    "xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n" +
    "0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n216\n%%EOF";

  fs.writeFileSync(filePath, minimalPdf);

  return `uploads/others/${name}`;
}

/* ------------------------------------------------------- */
/* VOICE GENERATOR                                          */
/* Downloads a real tiny MP3 and saves as .m4a             */
/* (the app serves it by path — extension is just a label) */
/* ------------------------------------------------------- */

// Public-domain short audio clips (direct download, no redirect)
const VOICE_SOURCES = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.w3schools.com/html/horse.mp3",
  "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3",
];
let voiceIdx = 0;
const _voiceCache = {};

async function generateVoice() {
  const url = VOICE_SOURCES[voiceIdx++ % VOICE_SOURCES.length];

  // Cache: reuse already-downloaded file path
  if (_voiceCache[url]) return _voiceCache[url];

  const ts = Date.now();
  const name = `${ts}-recording_${ts - Math.floor(Math.random() * 10000)}.m4a`;
  const rel = await downloadFile(url, name);
  const result = rel || "uploads/not-found-images/group-image.png";
  _voiceCache[url] = result;
  return result;
}

/* ------------------------------------------------------- */
/* GIFS                                                     */
/* Stored as full external URLs.                           */
/* The message_content getter only prepends baseUrl for    */
/* image/video/doc/voice — gif is returned as-is. ✓       */
/* ------------------------------------------------------- */

const GIFS = [
  "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/Zjuq13wY6V0fXw9Q15/giphy.gif",
  "https://media.giphy.com/media/xT9IgG50Lg7russbD6/giphy.gif",
  "https://media.giphy.com/media/du3J3cXyzhj75IOgvA/giphy.gif",
];

/* ------------------------------------------------------- */
/* LOCATION POOL */
/* ------------------------------------------------------- */

const LOCATIONS = [
  "40.7128,-74.0060",   // New York
  "34.0522,-118.2437",  // Los Angeles
  "51.5074,-0.1278",    // London
  "48.8566,2.3522",     // Paris
  "35.6762,139.6503",   // Tokyo
  "28.6139,77.2090",    // New Delhi
  "19.0760,72.8777",    // Mumbai
  "-33.8688,151.2093",  // Sydney
];

/* ------------------------------------------------------- */
/* RANDOM MESSAGE                                           */
/* text weighted higher so seeding is faster               */
/* ------------------------------------------------------- */

// location and voice are NOT in this pool — they are added
// as guaranteed extra messages per chat (see createMessages)
const MESSAGE_TYPES = ["text","text","text","image","image","video","doc","gif"];

async function randomMessage() {
  const type = MESSAGE_TYPES[Math.floor(Math.random() * MESSAGE_TYPES.length)];

  if (type === "text") {
    const txt = TEXT_MESSAGES[Math.floor(Math.random() * TEXT_MESSAGES.length)];
    return { type: "text", content: txt, thumbnail: txt };
  }

  if (type === "image") {
    const img = await generateImage();
    return { type: "image", content: img, thumbnail: img };
  }

  if (type === "video") {
    const video = await generateVideo();
    const thumb = await generateThumbnail();
    return { type: "video", content: video, thumbnail: thumb };
  }

  if (type === "doc") {
    const doc = generateDoc();
    return { type: "doc", content: doc, thumbnail: doc };
  }

  // gif — full external URL, stored as-is
  const gif = GIFS[Math.floor(Math.random() * GIFS.length)];
  return { type: "gif", content: gif, thumbnail: gif };
}

/* ------------------------------------------------------- */
/* BUILD MESSAGE LIST FOR A CHAT                           */
/* Always includes 1 location + 1 voice message           */
/* ------------------------------------------------------- */

async function buildMessages(chatId, participants, count = 10) {
  const messages = [];

  // Regular random messages
  for (let m = 0; m < count; m++) {
    const msg = await randomMessage();
    messages.push({
      chat_id: chatId,
      sender_id: participants[Math.floor(Math.random() * participants.length)],
      message_type: msg.type,
      message_content: msg.content,
      message_thumbnail: msg.thumbnail,
      message_seen_status: "seen",
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
    });
  }

  // Guaranteed location message
  const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  messages.push({
    chat_id: chatId,
    sender_id: participants[Math.floor(Math.random() * participants.length)],
    message_type: "location",
    message_content: loc,
    message_thumbnail: loc,
    message_seen_status: "seen",
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
  });

  // Guaranteed voice message
  const voice = await generateVoice();
  messages.push({
    chat_id: chatId,
    sender_id: participants[Math.floor(Math.random() * participants.length)],
    message_type: "voice",
    message_content: voice,
    message_thumbnail: "",
    message_seen_status: "seen",
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
  });

  return messages;
}

/* ------------------------------------------------------- */
/* USERS */
/* ------------------------------------------------------- */

const USERS = [
  { first_name: "Alice",    last_name: "Johnson",  user_name: "alice_john",       mobile_num: "9000000001", user_type: "regular"  },
  { first_name: "Bob",      last_name: "Smith",    user_name: "bob_smith",         mobile_num: "9000000002", user_type: "regular"  },
  { first_name: "Carol",    last_name: "Williams", user_name: "carol_will",       mobile_num: "9000000003", user_type: "regular"  },
  { first_name: "David",    last_name: "Lee",      user_name: "david_lee",       mobile_num: "9000000004", user_type: "regular"  },
  { first_name: "Eva",      last_name: "Martinez", user_name: "eva_mar",         mobile_num: "9000000005", user_type: "regular"  },
  { first_name: "TechMart", last_name: "Store",    user_name: "techmart_store",    mobile_num: "9000000006", user_type: "business" },
  { first_name: "Fresh",    last_name: "Cafe",     user_name: "freshcafe_cafe",   mobile_num: "9000000007", user_type: "business" },
  { first_name: "Gadget",   last_name: "Hub",      user_name: "gadgethub_hub",   mobile_num: "9000000008", user_type: "business" },
  { first_name: "Fitness",  last_name: "Club",     user_name: "fitnessclub_cl", mobile_num: "9000000009", user_type: "business" },
  { first_name: "Book",     last_name: "World",    user_name: "bookworld_word",   mobile_num: "9000000010", user_type: "business" },
];

/* ------------------------------------------------------- */
/* GROUP DEFINITIONS (5 groups)                            */
/* ------------------------------------------------------- */

const GROUPS = [
  { name: "Team Alpha",      description: "Main team chat",       memberCount: 5 },
  { name: "Project Phoenix", description: "Project discussion",   memberCount: 4 },
  { name: "Business Hub",    description: "Business updates",     memberCount: 6 },
  { name: "Friends Circle",  description: "Casual hangout",       memberCount: 4 },
  { name: "Support Squad",   description: "Customer support team",memberCount: 5 },
];

/* ------------------------------------------------------- */
/* CREATE DEMO DATA */
/* ------------------------------------------------------- */

async function createDemoData() {
  try {
    console.log("[seed] Creating demo users...");

    const createdUsers = await User.bulkCreate(
      USERS.map(u => ({
        ...u,
        full_name: `${u.first_name} ${u.last_name}`,
        country_code: "+1",
        country: "USA",
        country_short_name: "US",
        login_type: "phone",
        profile_setup_step: 3,
        is_demo: true,
        profile_pic: "uploads/default/avatar/avatar_1.png",
      })),
      { returning: true }
    );

    const createdUserData = createdUsers.map(u => ({
      user_id: u.user_id,
      name: `${u.first_name} ${u.last_name}`,
      mobile: u.mobile_num,
    }));
    const userIds = createdUserData.map(u => u.user_id);

    /* --------------------------------------------------- */
    /* CONTACT DETAILS — each user gets all others         */
    /* --------------------------------------------------- */

    console.log("[seed] Setting contact_details for each user...");

    for (const u of createdUserData) {
      const contacts = createdUserData
        .filter(c => c.user_id !== u.user_id)
        .map(c => ({ name: c.name, mobile: c.mobile, user_id: c.user_id }));

      await User.update(
        { contact_details: contacts },
        { where: { user_id: u.user_id } }
      );
    }

    /* --------------------------------------------------- */
    /* INDIVIDUAL CHATS (5)                                */
    /* user[0] paired with users[1..5]                     */
    /* --------------------------------------------------- */

    console.log("[seed] Creating individual chats...");

    for (let j = 1; j <= 5; j++) {
      const chat = await Chat.create({ chat_type: "individual" });
      const participants = [userIds[0], userIds[j]];

      await Participant.bulkCreate([
        { chat_id: chat.chat_id, user_id: participants[0], is_admin: true, is_creator: true },
        { chat_id: chat.chat_id, user_id: participants[1] },
      ]);

      const messages = await buildMessages(chat.chat_id, participants, 10);
      const createdMsgs = await Message.bulkCreate(messages, { returning: true });

      await Participant.update(
        { last_message_id: createdMsgs[createdMsgs.length - 1].message_id },
        { where: { chat_id: chat.chat_id } }
      );
    }

    /* --------------------------------------------------- */
    /* GROUP CHATS (5)                                     */
    /* --------------------------------------------------- */

    console.log("[seed] Creating group chats...");

    for (let g = 0; g < GROUPS.length; g++) {
      const grp = GROUPS[g];

      // Pick random members — always include user[0] as admin/creator
      const shuffled = [...userIds].sort(() => Math.random() - 0.5);
      const memberIds = [userIds[0], ...shuffled.filter(id => id !== userIds[0]).slice(0, grp.memberCount - 1)];

      const groupIcon = await generateImage();

      const chat = await Chat.create({
        chat_type: "group",
        group_name: grp.name,
        group_description: grp.description,
        group_icon: groupIcon,
      });

      await Participant.bulkCreate(
        memberIds.map((uid, idx) => ({
          chat_id: chat.chat_id,
          user_id: uid,
          is_admin: idx === 0,
          is_creator: idx === 0,
        }))
      );

      const messages = await buildMessages(chat.chat_id, memberIds, 10);
      const createdMsgs = await Message.bulkCreate(messages, { returning: true });

      await Participant.update(
        { last_message_id: createdMsgs[createdMsgs.length - 1].message_id },
        { where: { chat_id: chat.chat_id } }
      );
    }

    /* --------------------------------------------------- */
    /* STORIES — image & video (first 5 users)             */
    /* --------------------------------------------------- */

    console.log("[seed] Creating stories...");

    for (let idx = 0; idx < 5; idx++) {
      const uid = userIds[idx];

      const img = await generateImage();
      await Story.create({
        user_id: uid,
        caption: "Demo image story",
        media: img,
        thumbnail: img,
        story_type: "image",
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
      });

      if (idx % 2 === 0) {
        const video = await generateVideo();
        const thumb = await generateThumbnail();
        await Story.create({
          user_id: uid,
          caption: "Demo video story",
          media: video,
          thumbnail: thumb,
          story_type: "video",
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
        });
      }
    }

    /* --------------------------------------------------- */
    /* BROADCAST PUSH NOTIFICATIONS                         */
    /* --------------------------------------------------- */

    console.log("[seed] Creating broadcast push notifications...");

    await Broadcast_push_notification.bulkCreate([
      {
        title: "Kewoz Just Got Better 🚀",
        message: "We've added performance improvements and bug fixes for a smoother chat experience.",
        users: userIds,
      },
      {
        title: "New Features Are Live ✨",
        message: "Discover new chat tools and enhancements. Update Kewoz now!",
        users: userIds,
      },
      {
        title: "Faster & Smarter Chats ⚡",
        message: "Enjoy quicker message delivery and improved stability with the latest update.",
        users: userIds,
      },
      {
        title: "Happy New Year 🎆",
        message: "Start the year with new conversations and stronger connections on Kewoz.",
        users: userIds,
      },
      {
        title: "Exclusive Deal for You 💎",
        message: "Upgrade now and enjoy bonus features designed just for Kewoz users.",
        users: userIds,
      },
    ]);

    console.log("[seed] Demo data created successfully ✅");

  } catch (error) {
    console.error("[seed] Seeder error:", error);
  }
}

module.exports = { createDemoData };
 