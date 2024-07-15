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


@NgModule({
  providers: [],
  declarations: [
    ChatRromComponent,
    ChatUiComponent,
    DateFormatPipe,
    FileUploadDialogComponent
  ],
  imports: [
    CommonModule, MaterialModule, MatMenuModule,
    ChatsRoutingModule, FormsModule // Add FormsModule to imports array

  ]
})
export class ChatsModule { }
