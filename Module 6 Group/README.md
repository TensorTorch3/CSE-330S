[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/KFh9-ZY6)
# CSE330
Vincent Chen 525421 TensorTorch3 <br>
Aidan Taubenblat-Roberts 518759 atr1232 <br>
Link to instance: http://ec2-3-12-154-38.us-east-2.compute.amazonaws.com:3456 (for personal reference) <br>

## Creative Portion
For our creative portion, we implemented several features that enhance the user experience of the chat application:

1. **Real-time Typing Indicators**: When a user is typing in the message input field, other users in the same room see a usernam is typing..." message. Multiple simultaneous typers are handled gracefully with different messages depending on how many people are typing.

2. **Message Reactions**: Users can add emoji reactions (👍, ❤️, 😂, 😮, 😢) to any message in the chat. The reactions are tracked, counted, and displayed beneath each message, similar to popular messaging platforms like Slack or Discord.