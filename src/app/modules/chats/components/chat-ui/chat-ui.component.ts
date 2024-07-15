import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { ChatsService } from '../../services/chats.service';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged, filter, fromEvent, of, switchMap, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { MatMenuTrigger } from '@angular/material/menu';
import { FileUploadDialogComponent } from '../file-upload-dialog/file-upload-dialog.component';

export interface Message {
  message: string;
  timestamp: string;
  username: string;
  dpUrl?: string;
  showReactionMenu: boolean; // Ensure this is included if it's part of your message handling
}

@Component({
  selector: 'app-chat-ui',
  templateUrl: './chat-ui.component.html',
  styleUrls: ['./chat-ui.component.css']
})
export class ChatUiComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}