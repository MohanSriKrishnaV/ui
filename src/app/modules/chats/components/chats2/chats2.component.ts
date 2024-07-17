import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Socket, io } from 'socket.io-client';
import { ChatsService } from '../../services/chats.service';
import { FileUploadDialogComponent } from '../file-upload-dialog/file-upload-dialog.component';
import { Observable, Subscription, debounceTime, fromEvent } from 'rxjs';
import { Message } from '../chat-ui/chat-ui.component';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-chats2',
  templateUrl: './chats2.component.html',
  styleUrls: ['./chats2.component.css']
})
export class Chats2Component implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}