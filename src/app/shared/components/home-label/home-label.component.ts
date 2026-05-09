import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-home-label',
  standalone: true,
  templateUrl: './home-label.component.html',
  styleUrls: ['./home-label.component.scss'],
})
export class HomeLabelComponent {
  @Input() text: string = '';

  @HostBinding('style.--label-font-size')
  @Input()
  fontSize: string = '1rem';

  @HostBinding('style.--label-color')
  @Input()
  color: string = '#008c44';
}
