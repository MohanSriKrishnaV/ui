import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatRromComponent } from './components/chat-rrom/chat-rrom.component';
import { ChatUiComponent } from './components/chat-ui/chat-ui.component';
import { ChatStepperUiComponent } from './components/chat-stepper-ui/chat-stepper-ui.component';
import { Chats2Component } from './components/chats2/chats2.component';
import { ChatIdComponent } from './components/chat-id/chat-id.component';

const routes: Routes = [
  { path: '', redirectTo: 'id', pathMatch: 'full' }, // Redirects to /chat on app start

  { path: '', component: ChatRromComponent },
  // { path: 'ui', component: ChatUiComponent },
  { path: 'ui', component: ChatStepperUiComponent },
  // { path: 'ui2', component: Chats2Component },
  { path: 'id', component: ChatIdComponent },
  { path: '**', redirectTo: 'id' } // Redirects unknown paths to /chat



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatsRoutingModule { }
