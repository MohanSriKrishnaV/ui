import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatsRoutingModule } from './chats-routing.module';
import { ChatRromComponent } from './components/chat-rrom/chat-rrom.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatUiComponent } from './components/chat-ui/chat-ui.component';
import { DateFormatPipe } from './pipes/dates/dates.pipe';
import { MaterialModule } from '../material/material.module';
import { MatMenuModule } from '@angular/material/menu';
import { FileUploadDialogComponent } from './components/file-upload-dialog/file-upload-dialog.component';
import { ChatStepperUiComponent } from './components/chat-stepper-ui/chat-stepper-ui.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Chats2Component } from './components/chats2/chats2.component';
import { MatCardModule } from '@angular/material/card';
// import { MatProgressSpinnerModule } from '@angular/material';

import { MatFormFieldModule } from '@angular/material/form-field';
import { ChatIdComponent } from './components/chat-id/chat-id.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  providers: [],
  declarations: [
    ChatRromComponent,
    ChatUiComponent,
    DateFormatPipe,
    FileUploadDialogComponent,
    ChatStepperUiComponent,
    Chats2Component,
    ChatIdComponent
  ],
  imports: [
    MatProgressSpinnerModule, MatProgressBarModule, ReactiveFormsModule, CommonModule, MaterialModule, MatMenuModule, MatSnackBarModule, MatCardModule, MatFormFieldModule,
    ChatsRoutingModule, FormsModule// Add FormsModule to imports array

  ],
  exports: []
})
export class ChatsModule { }
