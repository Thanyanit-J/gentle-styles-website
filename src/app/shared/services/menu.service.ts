import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  menuOpen = new EventEmitter<void>();
  menuClose = new EventEmitter<void>();

  // a function that when call, emit event for menu that inject to open
  openMenu() {
    this.menuOpen.emit();
  }

  // a function that when call, emit event for menu that inject to close
  closeMenu() {
    this.menuClose.emit();
  }
}
