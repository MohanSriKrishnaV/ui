import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatRromComponent } from './components/chat-rrom/chat-rrom.component';
import { ChatUiComponent } from './components/chat-ui/chat-ui.component';

const routes: Routes = [
  { path: '', component: ChatRromComponent },
  { path: 'ui', component: ChatUiComponent }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatsRoutingModule { }
