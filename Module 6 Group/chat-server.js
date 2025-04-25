// Require the packages we will use:
const http = require("http"),
    fs = require("fs");

const port = 3456;
const file = "client.html";
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:
const server = http.createServer(function (req, res) {
    // This callback runs when a new connection is made to our HTTP server.

    fs.readFile(file, function (err, data) {
        // This callback runs when the client.html file has been read from the filesystem.

        if (err) return res.writeHead(500);
        res.writeHead(200);
        res.end(data);
    });
});
server.listen(port);

// Import Socket.IO and pass our HTTP server object to it.
const socketio = require("socket.io")(server);

// Attach our Socket.IO server to our HTTP server to listen
const io = socketio;

// Object to track users in each room
const rooms = {};
const privateRooms = new Map(); // Store room passwords
const roomCreators = {}; // Track who created each room
const bannedUsers = {}; // Track banned users for each room
const typingUsers = {}; // Track who is currently typing

io.sockets.on("connection", function (socket) {
    let currentRoom = null; // Track the room the user is currently in
    let currentUsername = null; // Track the username

    socket.on('message_to_server', function (data) {
        // This callback runs when the server receives a new message from the client.
        console.log("username: " + data["username"]); // log it to the Node.JS output
        console.log("message: " + data["message"]); // log it to the Node.JS output
        console.log("room: " + data["room"]); // log it to the Node.JS output
        io.to(data["room"]).emit("message_to_client", {
            username: data["username"],
            message: data["message"],
            room: data["room"],
            timestamp: new Date().getTime()
        });
    });

    socket.on('private_message', function (data) {
        const sender = data.sender;
        const recipient = data.recipient;
        const message = data.message;
        const room = data.room;
        
        // Find recipient's socket
        const recipientSocket = Object.values(io.sockets.sockets).find(s => s.username === recipient);
        
        if (recipientSocket) {
            // Send to recipient
            recipientSocket.emit("private_message_received", {
                sender: sender,
                message: message,
                timestamp: new Date().getTime()
            });
            
            // Send confirmation to sender
            socket.emit("private_message_sent", {
                recipient: recipient,
                message: message,
                timestamp: new Date().getTime()
            });
        } else {
            socket.emit("private_message_error", {
                message: "User is not in this room or doesn't exist"
            });
        }
    });

    socket.on('create_public_room', function (data) {
        // This callback runs when the server receives a new room creation request from the client.
        console.log("create_room: " + data["room"]); // log it to the Node.JS output
        
        // Set the creator of the room
        roomCreators[data["room"]] = data["username"];
        bannedUsers[data["room"]] = [];
        
        io.sockets.emit("public_room_created", { 
            room: data["room"],
            creator: data["username"]
        });
    });

    socket.on("create_private_room", function (data) {
        console.log("create_private_room: " + data["room"]);
        privateRooms.set(data["room"], data["password"]);
        
        // Set the creator of the room
        roomCreators[data["room"]] = data["username"];
        bannedUsers[data["room"]] = [];
        
        io.sockets.emit("private_room_created", { 
            room: data["room"],
            creator: data["username"]
        });
    });

    socket.on("join_room", function (data) {
        const username = data["username"];
        const room = data["room"];
        currentRoom = room;
        currentUsername = username;
        socket.username = username;

        // Check if user is banned from the room
        if (bannedUsers[room] && bannedUsers[room].includes(username)) {
            socket.emit("room_join_error", { message: "You are banned from this room" });
            return;
        }

        // Add the user to the room
        if (!rooms[room]) {
            rooms[room] = [];
        }
        if (!rooms[room].includes(username)) {
            rooms[room].push(username);
        }

        socket.join(room); // Join the room
        console.log(`${username} joined room: ${room}`);

        // Send room creator info to the client
        socket.emit("room_info", {
            room: room,
            creator: roomCreators[room]
        });

        // Notify all users in the room about the updated user list
        io.to(room).emit("update_user_list", { 
            room: room, 
            users: rooms[room],
            creator: roomCreators[room]
        });
    });

    socket.on("join_private_room", function (data) {
        const username = data["username"];
        const room = data["room"];
        const password = data["password"];

        // Check if user is banned
        if (bannedUsers[room] && bannedUsers[room].includes(username)) {
            socket.emit("private_room_error", { message: "You are banned from this room" });
            return;
        }

        if (privateRooms.get(room) === password) {
            // Password is correct
            currentRoom = room;
            currentUsername = username;
            socket.username = username;

            // Add the user to the room
            if (!rooms[room]) {
                rooms[room] = [];
            }
            if (!rooms[room].includes(username)) {
                rooms[room].push(username);
            }

            socket.join(room);
            console.log(`${username} joined private room: ${room}`);

            // Send room creator info to the client
            socket.emit("room_info", {
                room: room,
                creator: roomCreators[room]
            });

            // Notify the client that they joined successfully
            socket.emit("private_room_joined", { room: room });
            
            // Update the user list for everyone in the room
            io.to(room).emit("update_user_list", { 
                room: room, 
                users: rooms[room],
                creator: roomCreators[room]
            });
        } else {
            // Password is incorrect
            socket.emit("private_room_error", { message: "Incorrect password" });
        }
    });

    socket.on("leave_room", function (data) {
        const username = data["username"];
        const room = data["room"];

        // Remove the user from the room
        if (rooms[room]) {
            rooms[room] = rooms[room].filter(user => user !== username);
            if (rooms[room].length === 0) {
                delete rooms[room]; // Delete the room if it's empty
                delete roomCreators[room]; // Delete the creator info
                delete bannedUsers[room]; // Delete the banned users list
            }
        }

        socket.leave(room); // Leave the room
        console.log(`${username} left room: ${room}`);

        // Notify all users in the room about the updated user list
        io.to(room).emit("update_user_list", { 
            room: room, 
            users: rooms[room],
            creator: roomCreators[room]
        });
    });

    socket.on("kick_user", function(data) {
        const room = data.room;
        const userToKick = data.user;
        const kickedBy = data.kickedBy;
        
        if (roomCreators[room] === kickedBy) {
            // Find the socket of the user to kick
            const userSocket = Object.values(io.sockets.sockets).find(s => s.username === userToKick);
            
            if (userSocket) {
                // First remove from room list
                if (rooms[room]) {
                    rooms[room] = rooms[room].filter(user => user !== userToKick);
                }

                // Send kick notification
                userSocket.emit("kicked", { 
                    room: room, 
                    kickedBy: kickedBy 
                });
                
                // Force leave the room
                userSocket.leave(room);
                
                // Update everyone's user list
                io.to(room).emit("update_user_list", { 
                    room: room, 
                    users: rooms[room],
                    creator: roomCreators[room]
                });
                
                // Send system message
                io.to(room).emit("system_message", {
                    message: `${userToKick} has been kicked from the room by ${kickedBy}`,
                    room: room
                });
            }
        } else {
            socket.emit("action_error", { message: "Only the room creator can kick users" });
        }
    });
    
    socket.on("ban_user", function(data) {
        const room = data.room;
        const userToBan = data.user;
        const bannedBy = data.bannedBy;
        
        if (roomCreators[room] === bannedBy) {
            // Add to banned list
            if (!bannedUsers[room]) {
                bannedUsers[room] = [];
            }
            bannedUsers[room].push(userToBan);
            
            // Find the socket of the user to ban
            const userSocket = Object.values(io.sockets.sockets).find(s => s.username === userToBan);
            
            if (userSocket) {
                // First remove from room list
                if (rooms[room]) {
                    rooms[room] = rooms[room].filter(user => user !== userToBan);
                }

                // Send ban notification
                userSocket.emit("banned", { 
                    room: room, 
                    bannedBy: bannedBy 
                });
                
                // Force leave the room
                userSocket.leave(room);
                
                // Update everyone's user list
                io.to(room).emit("update_user_list", { 
                    room: room, 
                    users: rooms[room],
                    creator: roomCreators[room]
                });
                
                // Send system message
                io.to(room).emit("system_message", {
                    message: `${userToBan} has been banned from the room by ${bannedBy}`,
                    room: room
                });
            }
        } else {
            socket.emit("action_error", { message: "Only the room creator can ban users" });
        }
    });

    // Typing indicator
    socket.on("typing", function(data) {
        const username = data.username;
        const room = data.room;
        const isTyping = data.isTyping;
        
        if (!typingUsers[room]) {
            typingUsers[room] = [];
        }
        
        if (isTyping && !typingUsers[room].includes(username)) {
            typingUsers[room].push(username);
        } else if (!isTyping) {
            typingUsers[room] = typingUsers[room].filter(user => user !== username);
        }
        
        // Broadcast to everyone in the room except the sender
        socket.to(room).emit("typing_indicator", {
            users: typingUsers[room],
            room: room
        });
    });

    // Handle reactions
    socket.on("add_reaction", function(data) {
        const username = data.username;
        const messageId = data.messageId;
        const reaction = data.reaction;
        const room = data.room;
        
        io.to(room).emit("message_reaction", {
            messageId: messageId,
            reaction: reaction,
            username: username
        });
    });

    socket.on("disconnect", function () {
        // Handle user disconnection and remove them from the room
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom] = rooms[currentRoom].filter(user => user !== currentUsername);
            
            // Remove typing status
            if (typingUsers[currentRoom]) {
                typingUsers[currentRoom] = typingUsers[currentRoom].filter(user => user !== currentUsername);
                
                io.to(currentRoom).emit("typing_indicator", {
                    users: typingUsers[currentRoom],
                    room: currentRoom
                });
            }
            
            if (rooms[currentRoom].length === 0) {
                delete rooms[currentRoom];
                delete roomCreators[currentRoom];
                delete bannedUsers[currentRoom];
                delete typingUsers[currentRoom];
            } else {
                io.to(currentRoom).emit("update_user_list", { 
                    room: currentRoom, 
                    users: rooms[currentRoom],
                    creator: roomCreators[currentRoom] 
                });
            }
        }
    });
});

socketio.on("typing_indicator", function(data) {
    const typingDiv = document.getElementById("typing_indicator");
    
    if (data.users && data.users.length > 0) {
        // Clear previous content
        typingDiv.innerHTML = '';
        
        // Create name text
        const nameSpan = document.createElement('span');
        if (data.users.length === 1) {
            nameSpan.textContent = data.users[0] + " ";
        } else if (data.users.length === 2) {
            nameSpan.textContent = data.users.join(" and ") + " ";
        } else {
            nameSpan.textContent = "Multiple people ";
        }
        typingDiv.appendChild(nameSpan);
        
        // Create dots container
        const dotsDiv = document.createElement('div');
        dotsDiv.className = 'typing-dots';
        
        // Add three dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dotsDiv.appendChild(dot);
        }
        
        typingDiv.appendChild(dotsDiv);
        typingDiv.style.display = 'flex';
    } else {
        typingDiv.style.display = 'none';
        typingDiv.innerHTML = '';
    }
});