import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';

import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [],
  exports: [MatIconModule, MatDialogModule, MatStepperModule],
  imports: [
    CommonModule, MatIconModule, MatMenuModule

  ]
})
export class MaterialModule { }
