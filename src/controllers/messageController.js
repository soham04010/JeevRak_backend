const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Store active socket connections
const connectedUsers = new Map();

exports.handleSocketConnection = (socket, io) => {
    let authUserId = null;

    socket.on('authenticate', (data) => {
        try {
            const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
            authUserId = decoded.id;
            connectedUsers.set(authUserId, socket.id);
            socket.join(authUserId); 
            console.log(`User ${authUserId} authenticated on socket.`);
        } catch (error) {
            console.error('Socket Auth Error:', error.message);
        }
    });

    socket.on('sendMessage', async ({ recipientId, text }) => {
        if (!authUserId || !recipientId || !text) return;

        // Ensure IDs are valid ObjectIds
        const senderObjectId = new mongoose.Types.ObjectId(authUserId);
        const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

        const sortedIds = [senderObjectId.toString(), recipientObjectId.toString()].sort();
        const conversationId = sortedIds.join('_');

        try {
            // Save to MongoDB with explicit ObjectIds
            const message = await Message.create({
                conversationId,
                sender: senderObjectId,
                recipient: recipientObjectId,
                text,
                sentAt: new Date()
            });

            const messageData = {
                _id: message._id,
                conversationId,
                sender: authUserId, // Send strings back to client for easy comparison
                recipient: recipientId,
                text: message.text,
                sentAt: message.sentAt
            };

            // Emit to both parties
            socket.emit('message', messageData);
            io.to(recipientId).emit('message', messageData); 

        } catch (error) {
            console.error('Message Save Error:', error);
        }
    });

    socket.on('disconnect', () => {
        if (authUserId) connectedUsers.delete(authUserId);
    });
};

// @desc    Get list of conversations (Inbox)
exports.getInbox = async (req, res) => {
    try {
        // Force conversion to ObjectId for matching
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const inbox = await Message.aggregate([
            { 
                $match: { 
                    $or: [{ sender: userId }, { recipient: userId }] 
                } 
            },
            { $sort: { sentAt: -1 } },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" }
                }
            }
        ]);

        const populatedInbox = await Promise.all(inbox.map(async (item) => {
            const msg = item.lastMessage;
            
            // Determine the "Other" user
            // We compare Strings to ensure accuracy
            const myIdStr = req.user.id.toString();
            const senderIdStr = msg.sender.toString();
            
            const otherUserId = senderIdStr === myIdStr ? msg.recipient : msg.sender;
            
            const otherUser = await User.findById(otherUserId).select('name profilePicture role');
            
            return {
                conversationId: item._id,
                lastMessage: msg.text,
                sentAt: msg.sentAt,
                otherUser: otherUser || { name: 'Unknown User', profilePicture: '' }
            };
        }));

        res.status(200).json({ success: true, data: populatedInbox });
    } catch (err) {
        console.error("Inbox Error:", err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get chat history
exports.getConversationHistory = async (req, res) => {
    try {
        const recipientId = req.params.recipientId;
        const senderId = req.user.id;
        
        // Consistent Conversation ID logic
        const sortedIds = [senderId, recipientId].sort();
        const conversationId = sortedIds.join('_');

        const messages = await Message.find({ conversationId }).sort('sentAt');
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};