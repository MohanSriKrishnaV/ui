import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from './modules/material/material.module';

const routes: Routes = [
  { path: 'chat', loadChildren: () => import('./modules/chats/chats.module').then(m => m.ChatsModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes), MaterialModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
