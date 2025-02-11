import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Socket, io } from 'socket.io-client';
import { ChatsService } from '../../services/chats.service';
import { FileUploadDialogComponent } from '../file-upload-dialog/file-upload-dialog.component';
import { Observable, Subject, Subscription, catchError, debounceTime, fromEvent, throwError } from 'rxjs';
import { Message } from '../chat-ui/chat-ui.component';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

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
  @ViewChild('messageInput', { static: true }) messageInput: ElementRef;

  constructor(private router: Router, private fb: FormBuilder, private _snackBar: MatSnackBar, private dialog: MatDialog, private http: HttpClient, private chatsService: ChatsService) {

  }

  typingUsers: string[] = [];
  loader: boolean = true
  showPrevChat: boolean = true
  navExtras!: any
  ngOnInit(): void {
    this.navExtras = history.state;
    debugger
    if (this.navExtras?.roomId !== null || this.navExtras?.roomId !== undefined) {
      let localData = sessionStorage.getItem("roomId")
      if (localData) {
        this.navExtras["roomId"] = localData
        this.makeConnections()
      }
      else {
        this.router.navigate(['/chat/id']);
      }
    }
  }



  ngOnDestroy(): void {
    this.typingSubscription?.unsubscribe();
    this.socket?.disconnect(); // Disconnect socket when component is destroyed
  }


  makeConnections() {

    if (this.navExtras?.roomId) {
      this.socket = io('https://common-chat-room-server-2.onrender.com', {
        query: {
          roomId: this.navExtras?.roomId
        }
      }); // Replace with your WebSocket server URL
      // this.chatsService.joinRoom(this.navExtras?.roomId); // Join the specified room when component initializes
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.loader = false
        this.showTopSnackBar('Succesfully joined the chat room', 'Close');
        this.chatsService.joinRoom(this.navExtras.roomId, this.socket);
      });

      this.socket.on('typing', (response: any) => {
        console.log(response, "response typgn");
        this.typingSubject.next(response); // Update typingSubject with new usernames
      });
    }
    // console.log(history.state, "nav extras");

    this.showTopSnackBar('Kindly enter your name before entering the chat room', 'Close');
    this.socket.on('message', (messageContent: any) => {
      console.log(messageContent, "messageContent");

      const newMessage: any = {
        dpUrl: messageContent.dpUrl,
        id: messageContent.id,
        message: messageContent.message,
        timestamp: new Date().toISOString(),
        username: messageContent.username, // Assuming messageContent has a username field
        showReactionMenu: false, // Initialize showReactionMenu to false for new messages
        mediaType: messageContent?.mediaType,
        mediaUrl: messageContent?.mediaUrl,
        // roomId: this.navExtras.roomId // Include room ID
      };
      this.messages.push(newMessage); // Add incoming message to the messages array
    });

    this.typing$.subscribe((usernames: any) => {
      console.log(usernames, "usernames typing");
      this.typingUsers = usernames.filter((name: string) => name !== this.username);
      // console.log(this.typingUsers, "typingUsers");
    });


    this.socket.on('EmojisUpdated', (messageContent: any) => {
      console.log(messageContent, "messageContent emoji updated");
      const index = this.messages.findIndex(msg => msg.id === messageContent.id);
      console.log(index, "index");
      this.messages[index] = messageContent; // Update the message with new emoji counts
    });


    this.socket.on('roomJoined', (messageContent: any) => {
      console.log(messageContent, "messageContent roomJoined");
    });


    this.socket.on('messageDeleted', (messageContent: any) => {
      this.findAndDeleteMsg(messageContent)
      // this.
    });

    this.socket.on('messageEdited', (messageContent: any) => {
      this.findOneAndUpdateMsg(messageContent)
    });

    this.socket.on('gettingAllMsgs', (messageContent: any) => {
      if (messageContent?.length === 0) {
        this.openSnackBar('no Previous Chat history found', 'Close');
      }
      else {
        console.log(messageContent, "messageContent");
        this.messages.unshift(...messageContent); // Assuming messageContent is an array of messages
      }
    });

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
        dpUrl: this.dpUrl,
        roomId: this.navExtras?.roomId
      };
      this.socket.emit('message', messageWithMetadata); // Send message with metadata to WebSocket server
      this.chatsService.sendStopTypingEvent(this.username, this.navExtras?.roomId, this.socket);
      this.message = ''; // Clear message input
    }
  }

  selectedFile: File | null = null;
  dpUrl: string = '';
  uploadDp(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.post<{ dpUrl: string }>('https://common-chat-room-server-2.onrender.com/upload-dp', formData).subscribe(response => {
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
        mediaUrl: x,
        roomId: this.navExtras?.roomId
      };
      this.sendMessageToServer(messageWithMetadata, this.navExtras?.roomId);
    });
  }


  sendMessageToServer(messageWithMetadata: any, id: any): void {
    this.socket.emit('message', messageWithMetadata); // Send message with metadata to WebSocket server
    this.chatsService.sendStopTypingEvent(this.username, id, this.socket);
  }



  uploadFileToServer(file: File): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const uploadUrl = 'https://common-chat-room-server-2.onrender.com/upload/Media';

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

    if (this.messageInput) {
      this.typingSubscription = fromEvent(this.messageInput?.nativeElement, 'input')
      .pipe(
        debounceTime(2000) // Wait for 2 seconds of inactivity
      )
      .subscribe(() => {
        this.chatsService.sendStopTypingEvent(this.username, this.navExtras?.roomId, this.socket); // Trigger stopTyping event
      });
    }
    else {
      console.error('messageInput is not defined');
    }

  }


  onTyping(): void {
    if (this.stopTypingTimer) {
      this.stopTypingTimer.unsubscribe();
    }
    // console.log(this.navExtras, " this.navExtras");

    this.sendTypingEvent(this.username, this.navExtras?.roomId);

    this.stopTypingTimer = fromEvent(this.messageInput?.nativeElement, 'input')
      .pipe(
        debounceTime(2000)
      )
      .subscribe(() => {
        this.sendStopTypingEvent(this.username, this.navExtras?.roomId);
      });
  }
  sendTypingEvent(username: string, id: any): void {
    this.socket.emit('typing', username, id);
  }
  sendStopTypingEvent(username: string, id: any): void {
    this.socket.emit('stopTyping', username, id);
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
    this.chatsService.sendReaction(message, 'like', this.socket, this.navExtras["roomId"]); // Assuming 'id' exists in your message object
    this.closeAllContextMenusExcept(null);
  }

  loveMessage(message: any): void {
    console.log(`Loved message: ${message.message}`);
    this.chatsService.sendReaction(message, 'love', this.socket, this.navExtras["roomId"]);

    this.closeAllContextMenusExcept(null);
  }

  laughMessage(message: any): void {
    console.log(message, "message");

    // console.log(`Laughed at message: ${message.message}`);
    this.chatsService.sendReaction(message, 'laugh', this.socket, this.navExtras["roomId"]);

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
    message.editing = false
    // console.log(message, "message deletinf");
    this.chatsService.deleteMessage(message.id, this.socket, this.navExtras["roomId"]);
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

  // saveMessage(index: number) {
  //   // console.log("saveMessage");
  //   const editedMessage = this.messages[index].editedMessage;
  //   const messageId = this.messages[index].id;
  //   this.chatsService.editMessage(messageId, editedMessage, this.socket, this.navExtras["roomId"]); // Send edit request to backend
  //   this.messages[index].editing = false; // Exit edit mode

  // }


  saveMessage(index: number) {
    const editedMessage = this.messages[index].editedMessage;
    const originalMessage = this.messages[index].message; // Assuming 'message' holds the original content
    const messageId = this.messages[index].id;
    if (editedMessage !== originalMessage) {
      this.chatsService.editMessage(messageId, editedMessage, this.socket, this.navExtras["roomId"]); // Send edit request to backend
    }
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
      return 'https://common-chat-room-server-2.onrender.com/' + mediaUrl;
    } else {
      // Return a placeholder or handle the null case as per your application's requirement
      return 'https://common-chat-room-server-2.onrender.comdefault-placeholder.jpg';
    }
  }


  getAllMessages() {
    this._snackBar.open('Messages are being fetched...', 'Close', {
      duration: 500, // Duration in milliseconds
      verticalPosition: 'top', // Position the snackbar at the top
      horizontalPosition: 'center', // Center the snackbar horizontally
    });
    this.showPrevChat = false
    this.chatsService.getAllMsgs(this.socket, this.navExtras["roomId"]);
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
      verticalPosition: 'top' // Positioning the snackbar
    });
  }

  chatRoomId: string;
  chatRoomPassword: string;
  chatRoomIdFromBackEnd!: string;


  step1Completed: boolean = false;
  step2Completed: boolean = false;
  step3Completed: boolean = false;
  joinChatRoom(): any {
    this.chatsService.joinChatRoom(this.chatRoomId, this.chatRoomPassword).subscribe((res: any) => {
      console.log(res, "res from joinga room");
      if (res?.message === "Successfully joined chat room") {
        this.chatRoomIdFromBackEnd = res?.roomId
        this.showSuccessSnackBar(res?.message);
        this.step1Completed = true;
      }

    }, (err: any) => {

    })
  }


  goToNextStep(step: number) {
    if (step === 2) {
      if (this.username) {
        this.step1Completed = true;
        this.step2Completed = true;
      } else {
        // Handle condition when username is not filled
        console.log("Please enter your username before proceeding.");
        return; // Prevents stepper from moving forward
      }
    } else if (step === 3) {
      // Additional conditions for step 3, if needed
      if (this.step2Completed) {
        this.step3Completed = true;
      } else {
        // Handle condition when step 2 is not completed or file is not selected
        console.log("Please complete previous steps before proceeding.");
        return; // Prevents stepper from moving forward
      }
    }
  }


  backEndUrl: string = ""
  apiUrl = 'https://common-chat-room-server-2.onrender.com/chat-room'; // Replace with your backend API URL


  roomIdFromBackEnd!: any
  roomIdPassword!: any


  createChatRoom(): any {
    this.chatsService.createChatRoom().subscribe((res: any) => {

      //   {
      //     "message": "Chat room created successfully",
      //     "room": {
      //         "roomId": "473a68e5-f7bf-49da-a84a-71162c202d08",
      //         "password": "lcm7Fros",
      //         "_id": "66963e3e18732d1a5a92a2cf",
      //         "__v": 0
      //     },
      //     "password": "lcm7Fros"
      // }
      console.log(res, "res for chat room creation");
      if (res?.message === "Chat room created successfully") {
        this.roomIdFromBackEnd = res?.room?.roomId;
        this.roomIdPassword = res?.room?.password;
        this.showSuccessSnackBarRoomIdCreation(this.roomIdFromBackEnd, this.roomIdPassword);

      }
      else {
        this.showFailureSnackBar('Failed to create room. Please try again.');
      }
    })
  }
  showSuccessSnackBarRoomIdCreation(roomId: string, password: string): void {
    const message = `Room created successfully! Room ID: ${roomId}, Password: ${password}`;
    this._snackBar.open(message, 'Close', {
      duration: -1, // Indefinite duration
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success'] // Optional CSS class for styling
    });
  }
  showFailureSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: 5000, // 5 seconds
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-failure'] // Optional CSS class for styling
    });
  }


  private showSuccessSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: 3000, // Duration in milliseconds
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'] // Optional CSS class for styling
    });
  }
  private typingSubject = new Subject<string>();
  typing$ = this.typingSubject.asObservable();



  changeRoute() {
    // this.router.navigate(['chat//ui']); // Navigate to '/another-page'\
  }

  showTopSnackBar(message: string, action: string) {   // Method to show a snackbar with custom position
    this._snackBar.open(message, action, {
      duration: 2000, // Snackbar duration in milliseconds
      verticalPosition: 'top', // Position the snackbar at the top
    });
  }

  menuOpen: boolean = false;
  onMenuButtonClick(event: MouseEvent): void {
    if (this.menuOpen) {
      event.stopPropagation(); // Prevents event from reaching other elements
    }
  }

  onMenuClosed(): void {
    this.menuOpen = false;
  }
}
