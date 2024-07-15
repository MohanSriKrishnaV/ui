import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

import { MatIconModule } from '@angular/material/icon';
import { MatDialogContent, MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [],
  exports: [MatIconModule, MatDialogModule],
  imports: [
    CommonModule, MatIconModule, MatMenuModule

  ]
})
export class MaterialModule { }
