import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, catchError, of, throwError } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { Message } from '../components/chat-ui/chat-ui.component';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {
  private socket: Socket;


  private typingSubject = new Subject<string>();
  typing$ = this.typingSubject.asObservable();
  // private socket: Socketl
  constructor(private http: HttpClient, private router: Router) {
    this.socket = io('http://localhost:3000'); // Replace with your WebSocket server URL
    this.socket.on('roomJoined', (response: any) => {
      console.log(`Joined room ${response?.roomId} successfully`);
      // this.changeRoute()
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


  sendTypingEvent(username: string, id: any): void {
    this.socket.emit('typing', username, id);
  }

  sendStopTypingEvent(username: string, id: any, socket: any): void {
    socket.emit('stopTyping', username, id);
  }


  sendReaction(message: any, reaction: string, socket: any, roomId: any): void {
    console.log(message, "message");
    const { id: messageId, username } = message; // Destructure id as messageId and username
    socket.emit('messageReaction', { messageId, reaction, username, roomId });
  }

  deleteMessage(messageId: string, socket: any, roomId: any) {
    socket.emit('deleteMessage', { messageId, roomId });
  }

  editMessage(messageId: string, newMessage: string, socket: any, roomId: any) {
    socket.emit('editMessage', { id: messageId, newMessage: newMessage, roomId: roomId });
  }

  getAllMsgs(socket: any, id: any) {
    // console.log(id, "id");
    socket.emit('getAllMsgs', id);
  }
  apiUrl = 'http://localhost:3000'; // Replace with your backend API URL

  createChatRoom(): Observable<any> {
    const body = {};
    return this.http.post<any>(`${this.apiUrl}/chats/create`, body);
  }


  joinChatRoom(roomId: string, password: string): Observable<any> {
    const body = { roomId, password };
    return this.http.post<any>(`${this.apiUrl}/chats/join`, body)
  }
  joinRoom(roomId: string, socket: any): void {
    socket.emit('joinRoom', roomId); // Emit 'joinRoom' event to server with roomId
  }
}
