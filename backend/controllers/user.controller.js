import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const senderId = req.user._id;
    const conversations = await Conversation.find({ participants: senderId });

    const userIds = conversations.reduce((acc, conversation) => {
      conversation.participants.forEach((participantId) => {
        if (
          participantId.toString() !== senderId.toString() &&
          !acc.includes(participantId.toString())
        ) {
          acc.push(participantId.toString());
        }
      });
      return acc;
    }, []);

    const users = await User.find({ _id: { $in: userIds } }).select(
      "-password -refresh_token"
    );

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
