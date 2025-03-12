import { animate, animation, keyframes, style } from "@angular/animations";

export const slideInAnimation = animation([
    animate('{{ timing }}', keyframes([
        style({ transform: '{{ from }}', offset: 0 }),
        style({ transform: '{{ to }}', offset: 1 }),
    ])
    ),
], {
    params: {
        timing: '',
        from: '',
        to: ''
    }
});