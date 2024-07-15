import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatsService } from '../../services/chats.service';

@Component({
  selector: 'app-chat-rrom',
  templateUrl: './chat-rrom.component.html',
  styleUrls: ['./chat-rrom.component.css']
})
export class ChatRromComponent implements OnInit {
  roomId: string;

  constructor(private websocketService: ChatsService) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }

  connectToRoom(): void {
    this.websocketService.connectToRoom(this.roomId);
  }


}
