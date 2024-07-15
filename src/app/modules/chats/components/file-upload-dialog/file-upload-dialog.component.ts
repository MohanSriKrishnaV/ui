import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.css']
})
export class FileUploadDialogComponent implements OnInit {
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  selectedFile: File | null = null;

  @Output() fileUploaded = new EventEmitter<any>();
  @Output() uploadCancelled = new EventEmitter<void>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      let fileType = 'text';
      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type.startsWith('video/')) {
        fileType = 'video';
      }
      this.fileUploaded.emit({ file, type: fileType });
    }
  }


  onSend(): void {
    if (this.selectedFile) {
      this.fileUploaded.emit(this.selectedFile);
    }
  }

  onCancel(): void {
    this.uploadCancelled.emit();
  }

}
