import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Socket, io } from 'socket.io-client';
import { ChatsService } from '../../services/chats.service';
import { FileUploadDialogComponent } from '../file-upload-dialog/file-upload-dialog.component';
import { Observable, Subscription, debounceTime, fromEvent } from 'rxjs';
import { Message } from '../chat-ui/chat-ui.component';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-chat-stepper-ui',
  templateUrl: './chat-stepper-ui.component.html',
  styleUrls: ['./chat-stepper-ui.component.css']
})
export class ChatStepperUiComponent implements OnInit {
  private socket: Socket;
  messages: any[] = [];
  message: any = '';
  username = '';
  @ViewChild(MatMenuTrigger) menu: MatMenuTrigger;


  /// is typing 


  @ViewChild('messageInput', { static: true }) messageInput: ElementRef;


  constructor(private _snackBar: MatSnackBar, private dialog: MatDialog, private http: HttpClient, private chatsService: ChatsService) {
    this.socket = io('https://common-chat-room-server-1.onrender.com/'); // Replace with your WebSocket server URL
  }


  typingUsers: string[] = [];

  // Method to show a snackbar with custom position
  showTopSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000, // Snackbar duration in milliseconds
      verticalPosition: 'top', // Position the snackbar at the top
    });
  }
  ngOnInit(): void {
    this.showTopSnackBar('Kindly enter your name before entering the chat room', 'Close');

    this.socket.on('message', (messageContent: any) => {
      const newMessage: any = {
        dpUrl: messageContent.dpUrl,
        id: messageContent.id,
        message: messageContent.message,
        timestamp: new Date().toISOString(),
        username: messageContent.username, // Assuming messageContent has a username field
        showReactionMenu: false, // Initialize showReactionMenu to false for new messages
        mediaType: messageContent?.mediaType,
        mediaUrl: messageContent?.mediaUrl
      };
      this.messages.push(newMessage); // Add incoming message to the messages array
    });

    this.chatsService.typing$.subscribe((usernames: any) => {

      this.typingUsers = usernames.filter((name: string) => name !== this.username);
      // console.log(this.typingUsers, "typingUsers");
    });


    this.socket.on('EmojisUpdated', (messageContent: any) => {
      console.log(messageContent, "messageContent emoji updated");
      const index = this.messages.findIndex(msg => msg.id === messageContent.id);
      console.log(index, "index");
      this.messages[index] = messageContent; // Update the message with new emoji counts
    });


    this.socket.on('messageDeleted', (messageContent: any) => {
      this.findAndDeleteMsg(messageContent)
      // this.
    });

    this.socket.on('messageEdited', (messageContent: any) => {
      this.findOneAndUpdateMsg(messageContent)
    });

    this.socket.on('gettingAllMsgs', (messageContent: any) => {
      console.log(messageContent, "messageContent");
      this.messages.unshift(...messageContent); // Assuming messageContent is an array of messages
    });
  }



  ngOnDestroy(): void {

    this.typingSubscription.unsubscribe();
    this.socket.disconnect(); // Disconnect socket when component is destroyed
  }

  sendMessage(): void {
    const trimmedMessage = this.message.trim();
    const trimmedUsername = this.username.trim() || 'anonymous'; // Use "anonymous" if username is empty
    if (trimmedMessage) {
      const timestamp = new Date().toISOString(); // Get current timestamp
      const messageWithMetadata = {
        message: trimmedMessage,
        timestamp,
        username: trimmedUsername,
        dpUrl: this.dpUrl
      };
      this.socket.emit('message', messageWithMetadata); // Send message with metadata to WebSocket server
      this.chatsService.sendStopTypingEvent(this.username);
      this.message = ''; // Clear message input
    }
  }

  selectedFile: File | null = null;
  dpUrl: string = '';
  uploadDp(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post<{ dpUrl: string }>('https://common-chat-room-server-1.onrender.com/upload-dp', formData).subscribe(response => {
        this.dpUrl = response.dpUrl;
        this.openSnackBar('Display picture uploaded successfully.', 'Close');
      });
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }
  userSelectedMedia!: any
  openFileUploadDialog(): void {
    const dialogRef = this.dialog.open(FileUploadDialogComponent);

    dialogRef.componentInstance.fileUploaded.subscribe((file: any) => {
      // Handle the file upload logic here
      console.log('File uploaded:', file);
      const { files, type } = file;
      this.sendMessageMedia(file);
      dialogRef.close();
    });

    dialogRef.componentInstance.uploadCancelled.subscribe(() => {
      // Handle the cancellation logic here
      console.log('File upload cancelled');
      dialogRef.close();
    });
  }

  sendMessageMedia(data: any) {
    const { file, type } = data;
    console.log(file, type);

    const trimmedUsername = this.username.trim() || 'anonymous'; // Use "anonymous" if username is empty
    const timestamp = new Date().toISOString(); // Get current timestamp

    // Example: Upload file to server and get URL
    this.uploadFileToServer(file).subscribe((mediaUrl: any) => {
      console.log(mediaUrl, "mediaUrl");
      let x = mediaUrl["mediaUrl"]
      const messageWithMetadata = {
        message: '', // No message text for media messages
        timestamp,
        username: trimmedUsername,
        dpUrl: this.dpUrl,
        mediaType: type === 'image' ? 'image' : 'video', // Determine media type based on 'type' parameter
        mediaUrl: x
      };
      this.sendMessageToServer(messageWithMetadata);
    });
  }


  sendMessageToServer(messageWithMetadata: any): void {
    this.socket.emit('message', messageWithMetadata); // Send message with metadata to WebSocket server
    this.chatsService.sendStopTypingEvent(this.username);
  }



  uploadFileToServer(file: File): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const uploadUrl = 'https://common-chat-room-server-1.onrender.com/upload/Media';

    return this.http.post<string>(uploadUrl, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
        // Add any additional headers as needed
      })
    });
  }

  ///typimng 
  private typingSubscription: Subscription;
  private stopTypingTimer: Subscription;

  ngAfterViewInit(): void {
    this.typingSubscription = fromEvent(this.messageInput.nativeElement, 'input')
      .pipe(
        debounceTime(2000) // Wait for 2 seconds of inactivity
      )
      .subscribe(() => {
        this.chatsService.sendStopTypingEvent(this.username); // Trigger stopTyping event
      });
  }


  onTyping(): void {
    if (this.stopTypingTimer) {
      this.stopTypingTimer.unsubscribe();
    }

    this.chatsService.sendTypingEvent(this.username);

    this.stopTypingTimer = fromEvent(this.messageInput?.nativeElement, 'input')
      .pipe(
        debounceTime(2000)
      )
      .subscribe(() => {
        this.chatsService.sendStopTypingEvent(this.username);
      });
  }


  toggleReactionMenu(message: Message): void {
    message.showReactionMenu = !message.showReactionMenu; // Toggle menu state
  }







  toggleContextMenu(message: any): void {
    console.log(message, "message");

    message.showContextMenu = !message.showContextMenu;
  }


  openContextMenu(event: MouseEvent, message: any): void {
    event.preventDefault(); // Prevent default browser context menu
    this.closeAllContextMenusExcept(message);
  }

  closeAllContextMenusExcept(exceptMessage: any): void {
    this.messages.forEach(msg => {
      if (msg !== exceptMessage) {
        msg.showContextMenu = false;
      }
    });
  }

  likeMessage(message: any): void {
    console.log(`Liked message: ${message.message}`);
    this.chatsService.sendReaction(message, 'like'); // Assuming 'id' exists in your message object
    this.closeAllContextMenusExcept(null);
  }

  loveMessage(message: any): void {
    console.log(`Loved message: ${message.message}`);
    this.chatsService.sendReaction(message, 'love');

    this.closeAllContextMenusExcept(null);
  }

  laughMessage(message: any): void {
    console.log(message, "message");

    // console.log(`Laughed at message: ${message.message}`);
    this.chatsService.sendReaction(message, 'laugh');

    this.closeAllContextMenusExcept(null);
  }
  defaultImgUrl: string = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQArwMBIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAgQFAQMH/8QALhABAQACAQIFAgILAAAAAAAAAAECAxEEIRIxQVFhcYEFIhMyM0JDUmJyobHB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAMAwEAAhEDEQA/APqgCoAAAAAAAAAAAAAAAAAAAAAAAAAAAAA5cpjOcrJPkHRXy6zTLxPFl9IY9bpt4vM+sBYEMd2vL9XZjfumAAAAAAAAAAAAAAACp127LGTXj2uXegdT1cwtw18W+t9FLZsz2XnPK2ogABgPfR1WeqyZfmw9vZ4Bg2ccplJce893VHoNtmV1XyveLwAAAAAAAAAAAAOsfqM/0m7LL54n0aud4xyvtLWOAAoAAAAnpy8O3C/1RrsbC8Z432sbPrygAAAAAAAAAAAAhuvGrZz/AC1kNLrdl14dv3uzNWAAAAAABPNsxjTtWr0uzLbqmWXn5IPUAAAAAAAAAAAFX8RluqWelZ7W34XZpzxnnZ2+rKyxywvGcsvssHAAAAAAGn0Us6fHn15rOw157LxhLf8AjXxnhxxx9uyDoAAAAAAAAAAACn+Ia+ZjnPTtauObMZnhljl5WAxhLbrurO4ZecRWAAAD06fVd2zw+k70F3odfg1XK9rl/pZJJJxJxPYQAAAAAAAAAAAAB1W6jqcdV8HFuXt6QFbr/wBtP7YrJ7duW3O5Z+dQWAAAufh3ns+ym9NO7PVlbjxZZxZUGsPHp+ox3TiSzKd7K9wcAAAAAAAAHMspjOcrJPmquzrsZ214+L5vkC2hnu165+fKT4Z2zqt2ycXLie0eIL23rp/Dx5+ap7M8tmXizvNRFgAAAAAAnq25arzhx91zV12HlsxuPzPJQEGxhswznOFl+iTFls7y8X4e+vq92E4uXintQaYq6utwy7bJcb/hZl5ks4svtQdAAdneyOAMrqdmWzZfFe0tkjyAABQAAAAAAAAAAAAWeizyx24YS/lyvFgFGiAg/9k="
  trackByMessageId(index: number, message: any): string {
    return message.id;
  }




  getEmojiCount(message: any, emojiType: string): number {
    const emoji = message?.emojis?.find((e: { type: string; }) => e.type === emojiType);
    return emoji ? emoji.count : 0;
  }



  // Inside your component class
  editMessage(msg: any) {
    // Implement edit functionality (e.g., open a dialog to edit the message)
    console.log('Editing message:', msg);
  }



  deleteMessage(message: any) {
    console.log(message, "message deletinf");

    this.chatsService.deleteMessage(message.id);
    // Optionally, update messages array or UI immediately for instant feedback
  }

  findAndDeleteMsg(messageContent: any) {

    const deletedIndex = this.messages.findIndex(msg => msg.id === messageContent);
    console.log(deletedIndex, "deletedIndex");

    if (deletedIndex !== -1) {
      this.messages[deletedIndex].mediaType = false;
      this.messages[deletedIndex].message = "user has deleted the message";
      this.messages[deletedIndex].showEmojis = true;

    }
  }

  findOneAndUpdateMsg(messageContent: any) {
    const editedIndex = this.messages.findIndex(msg => msg.id === messageContent.id);
    if (editedIndex !== -1) {
      this.messages[editedIndex].message = messageContent.message; // Update message content
    }
  }

  toggleEditMode(msg: any) {
    msg.editing = true; // Enable edit mode
    msg.editedMessage = msg.message; // Initialize edited message with current message content
  }

  saveMessage(index: number) {
    console.log("saveMessage");

    const editedMessage = this.messages[index].editedMessage;
    const messageId = this.messages[index].id;
    this.chatsService.editMessage(messageId, editedMessage); // Send edit request to backend
    this.messages[index].editing = false; // Exit edit mode

  }

  cancelEdit(index: number) {
    this.messages[index].editing = false; // Exit edit mode
  }

  normalizeMediaUrl(mediaUrl: string): string {
    // Check if mediaUrl exists and is not empty
    if (mediaUrl) {
      // Replace double backslashes with single backslashes if necessary
      mediaUrl = mediaUrl.replace(/\\/g, '/'); // Replace '\\' with '/'
      // Assuming mediaUrl is relative, concatenate it with the base URL
      return 'https://common-chat-room-server-1.onrender.com/' + mediaUrl;
    } else {
      // Return a placeholder or handle the null case as per your application's requirement
      return 'https://common-chat-room-server-1.onrender.com/default-placeholder.jpg';
    }
  }


  getAllMessages() {
    this.chatsService.getAllMsgs();

  }
  @ViewChild('stepper') stepper: MatStepper;

  // validateUsername() {
  //   if (!this.username || this.username.trim().length === 0) {
  //     this.openSnackBar('Please enter your name.', 'Close');
  //     // Disable stepper advancement
  //     this.stepper._steps.forEach(step => step.completed = false);
  //   } else {
  //     // Enable stepper advancement
  //     this.stepper._steps.forEach(step => step.completed = true);
  //     // Proceed to the next step programmatically
  //     this.stepper.next();
  //   }
  // }

  openSnackBar(message: string, action: string) {
    return this._snackBar.open(message, action, {
      duration: 3000, // Duration in milliseconds
      verticalPosition: 'bottom' // Positioning the snackbar
    });
  }
}
