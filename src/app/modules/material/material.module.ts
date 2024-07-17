import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';

import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';


@NgModule({
  declarations: [],
  exports: [MatIconModule, MatDialogModule, MatStepperModule, MatTabsModule, MatFormFieldModule],
  imports: [
    CommonModule, MatIconModule, MatMenuModule

  ]
})
export class MaterialModule { }
