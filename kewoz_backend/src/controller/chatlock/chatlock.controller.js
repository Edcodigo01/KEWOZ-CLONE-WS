const bcrypt = require("bcrypt");
const { Participant } = require("../../../models");
const { getUser } = require("../../service/repository/user.service");
const socket_service = require("../../service/common/socket.service");


exports.lockChat = async (req, res) => {
  try {
    const { chat_id, pin } = req.body;
    const user_id = req.authData.user_id;

    // Check if participant exists
    const participant = await Participant.findOne({ where: { chat_id, user_id } });
    if (!participant) {
      return res.status(404).json({ status: false, message: "Chat not found" });
    }

    // Check if user already has any locked chat
    const existingLockedChat = await Participant.findOne({
      where: { user_id, is_locked: true },
    });

    let hashedPin;

    if (existingLockedChat) {
      // User already has a locked chat, use existing PIN
      hashedPin = existingLockedChat.lock_pin;
    } else {
      // User has no locked chat, PIN is required
      if (!pin) {
        return res.status(400).json({ status: false, message: "PIN is required to lock chat" });
      }
      hashedPin = await bcrypt.hash(pin, 10);
    }

    // Lock this participant chat
    await participant.update({
      is_locked: true,
      lock_pin: hashedPin,
      locked_at: new Date(),
    });

    // Emit socket event to all user's devices
    const user = await getUser({ user_id });
    if (user?.socket_ids?.length) {
      socket_service.emitEvent(user.socket_ids, "chat_locked", { chat_id });
    }

    return res.json({ status: true, message: "Chat locked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.unlockChat = async (req, res) => {
  try {
    const { chat_id, pin } = req.body;
    const user_id = req.authData.user_id;

    const participant = await Participant.findOne({ where: { chat_id, user_id } });

    if (!participant || !participant.is_locked) {
      return res.status(400).json({ status: false, message: "Chat is not locked" });
    }

    const isMatch = await bcrypt.compare(pin, participant.lock_pin);
    if (!isMatch) {
      return res.status(401).json({ status: false, message: "Invalid PIN" });
    }

    // Emit socket event to all devices
    const user = await getUser({ user_id });
    if (user?.socket_ids?.length) {
      socket_service.emitEvent(user.socket_ids, "chat_unlocked", { chat_id });
    }

    return res.json({ status: true, message: "Chat unlocked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


exports.RemoveChatLock = async (req, res) => {
  try {
    const { chat_id,  } = req.body;
    const user_id = req.authData.user_id;

    const participant = await Participant.findOne({ where: { chat_id, user_id } });

    if (!participant || !participant.is_locked) {
      return res.status(400).json({ status: false, message: "Chat is not locked" });
    }

  

       await participant.update({
      is_locked: false  ,
      lock_pin: null,
      locked_at: null,});

    // Emit socket event to all devices
    const user = await getUser({ user_id });
    if (user?.socket_ids?.length) {
      socket_service.emitEvent(user.socket_ids, "chat_unlocked", { chat_id });
    }

    return res.json({ status: true, message: "Chat unlocked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};




/**
 * Reset chat lock PIN
 * User can set a new PIN for all locked chats or create a new one if none exists
 */
exports.resetChatPin = async (req, res) => {
  try {
    const { new_pin } = req.body;
    const user_id = req.authData.user_id;

    if (!new_pin) {
      return res.status(400).json({ status: false, message: "New PIN is required" });
    }

    const hashedPin = await bcrypt.hash(new_pin, 10);

    // Find all locked chats of the user
    const lockedChats = await Participant.findAll({ where: { user_id, is_locked: true } });

    if (lockedChats.length === 0) {
      // No locked chats exist, just store PIN for future use
      await Participant.create({
        user_id,
        is_locked: false,
        lock_pin: hashedPin,
        locked_at: null,
      });
      return res.json({ status: true, message: "New PIN set successfully" });
    }

    // Update PIN for all existing locked chats
    for (const chat of lockedChats) {
      await chat.update({ lock_pin: hashedPin });
    }

    // Notify all devices that PIN was reset (optional)
    const user = await getUser({ user_id });
    if (user?.socket_ids?.length) {
      socket_service.emitEvent(user.socket_ids, "chat_pin_reset", {});
    }

    return res.json({ status: true, message: "PIN reset successfully for all locked chats" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};