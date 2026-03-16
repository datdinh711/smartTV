
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true, // Nếu bạn sử dụng Angular 14+, bạn có thể làm standalone component
  imports: [], // Thêm bất kỳ module nào dialog component này cần
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  // @Output tạo ra một EventEmitter để phát sự kiện ra bên ngoài component
  @Output() closeEvent = new EventEmitter<void>();

  // Hàm này sẽ được gọi khi:
  // 1. Click vào lớp nền mờ (dim view overlay)
  // 2. Click vào nút "Đóng" bên trong dialog
  closeDialog() {
    // Phát sự kiện 'closeEvent' ra component cha
    // Component cha sẽ nhận được sự kiện này và xử lý việc ẩn dialog đi
    this.closeEvent.emit();
  }
}