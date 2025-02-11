import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from './modules/material/material.module';

const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' }, // Redirects to /chat on app start
  { path: 'chat', loadChildren: () => import('./modules/chats/chats.module').then(m => m.ChatsModule) },
  { path: '**', redirectTo: 'chat' } // Redirects unknown paths to /chat
];


@NgModule({
  imports: [RouterModule.forRoot(routes), MaterialModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
