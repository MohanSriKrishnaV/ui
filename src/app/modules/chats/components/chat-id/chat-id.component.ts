import { Component, OnInit } from '@angular/core';
import { ChatsService } from '../../services/chats.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-chat-id',
  templateUrl: './chat-id.component.html',
  styleUrls: ['./chat-id.component.css']
})
export class ChatIdComponent implements OnInit {
  constructor(private router: Router, private fb: FormBuilder, private _snackBar: MatSnackBar, private dialog: MatDialog, private http: HttpClient, private chatsService: ChatsService) { }
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  backEndUrl: string = ""
  apiUrl = 'http://localhost:3000/chat-room'; // Replace with your backend API URL


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

  chatRoomIdFromBackEnd!: string;

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
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success'] // Optional CSS class for styling
    });
  }
  chatRoomId: string;
  chatRoomPassword: string;

  joinChatRoom(): any {
    this.chatsService.joinChatRoom(this.chatRoomId, this.chatRoomPassword).subscribe((res: any) => {
      // console.log(res, "res from joinga room");
      if (res?.message === "Successfully joined chat room") {
        this.chatRoomIdFromBackEnd = res?.roomId
        this.showSuccessSnackBar(res?.message);
        const navigationExtras: NavigationExtras = {
          state: { roomId: this.chatRoomIdFromBackEnd }
        };
        console.log(navigationExtras, "navigationExtras");
        sessionStorage.setItem("roomId", this.chatRoomIdFromBackEnd)
        this.router.navigate(['/chat/ui'], navigationExtras);
        // this.router.navigate(['/chat/ui']);
      }
      else {
        this.showSnackBar("inavlid password or room Id entered"); // Assuming `res.message` contains error messages
      }
    }, (err: any) => {
      this.showSnackBar("error connecting to chat room kindly check the password and id"); // Assuming `res.message` contains error messages

    })
  }
  showSnackBar(message: string): void {
    this._snackBar.open(message, 'Close', {
      duration: 3000, // Duration in milliseconds
      panelClass: ['error-snackbar'], // Optional CSS class for custom styling,
      verticalPosition: 'top' // Positioning the snackbar
    });
  }
}
