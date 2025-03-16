import { animate, animation, keyframes, style } from "@angular/animations";

export const slideInAnimation = animation([
    animate('{{ timing }}', keyframes([
        style({ transform: '{{ from }} rotate(30deg)', opacity: 0, offset: 0 }),
        style({ transform: '{{ between }} rotate(20deg)', opacity: 0.5, offset: 0.5 }),
        style({ transform: '{{ to }} rotate(0deg)', opacity: 1, offset: 1 }),
    ])
    ),
], {
    params: {
        timing: '',
        from: '',
        between: '',
        to: ''
    }
});