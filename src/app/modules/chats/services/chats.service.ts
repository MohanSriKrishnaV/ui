import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { Message } from '../components/chat-ui/chat-ui.component';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  private socket: Socket;


  private typingSubject = new Subject<string>();
  typing$ = this.typingSubject.asObservable();
  // private socket: Socketl
  constructor(private router: Router) {
    this.socket = io('http://localhost:3000'); // Replace with your WebSocket server URL
    this.socket.on('roomJoined', (response: any) => {
      console.log(`Joined room ${response.roomId} successfully`);
      this.changeRoute()
      // Optionally handle further logic here based on the response
    });
    this.socket.on('typing', (response: any) => {
      // console.log(`user ${response} typiong`);
      this.typingSubject.next(response); // Update typingSubject with new usernames

      // Optionally handle further logic here based on the response
    });

  }


  changeRoute() {
    this.router.navigate(['chat//ui']); // Navigate to '/another-page'

  }

  connectToRoom(roomId: string): void {
    this.socket.emit('joinRoom', roomId); // Emit an event to join a specific room
  }

  onMessage(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('message', (data: any) => observer.next(data)); // Listen for incoming messages
    });
  }

  sendMessage(message: string): void {
    this.socket.emit('message', message); // Send a message to the WebSocket server
  }


  sendTypingEvent(username: string): void {
    this.socket.emit('typing', username);
  }

  sendStopTypingEvent(username: string): void {
    this.socket.emit('stopTyping', username);
  }


  sendReaction(message: any, reaction: string): void {
    console.log(message, "message");
    const { id: messageId, username } = message; // Destructure id as messageId and username
    this.socket.emit('messageReaction', { messageId, reaction, username });
  }

  deleteMessage(messageId: string) {
    this.socket.emit('deleteMessage', messageId);
  }

  editMessage(messageId: string, newMessage: string) {
    this.socket.emit('editMessage', { id: messageId, newMessage: newMessage });
  }

  getAllMsgs() {
    this.socket.emit('getAllMsgs');

  }
}
