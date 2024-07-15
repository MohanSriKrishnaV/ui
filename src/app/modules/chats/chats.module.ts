import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatsRoutingModule } from './chats-routing.module';
import { ChatRromComponent } from './components/chat-rrom/chat-rrom.component';
import { FormsModule } from '@angular/forms';
import { ChatUiComponent } from './components/chat-ui/chat-ui.component';
import { DateFormatPipe } from './pipes/dates/dates.pipe';
import { MaterialModule } from '../material/material.module';
import { MatMenuModule } from '@angular/material/menu';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { ChatStepperUiComponent } from './components/chat-stepper-ui/chat-stepper-ui.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Chats2Component } from './components/chats2/chats2.component';
import { MatCardModule } from '@angular/material/card';

import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  providers: [],
  declarations: [
    ChatRromComponent,
    ChatUiComponent,
    DateFormatPipe,
    FileUploadDialogComponent,
    ChatStepperUiComponent,
    Chats2Component
  ],
  imports: [
    CommonModule, MaterialModule, MatMenuModule, MatSnackBarModule, MatCardModule, MatFormFieldModule,
    ChatsRoutingModule, FormsModule // Add FormsModule to imports array

  ]
})
export class ChatsModule { }
