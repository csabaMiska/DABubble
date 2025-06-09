import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StandardEmojisService {

  standardEmojis = [
      {
        "emoji": {
          "annotation": "check box with check",
          "group": 8,
          "order": 4633,
          "shortcodes": [
            "ballot_box_with_check"
          ],
          "tags": [
            "ballot",
            "box",
            "check",
            "checked",
            "done",
            "off",
            "tick",
            "✔"
          ],
          "unicode": "☑️",
          "version": 0.6,
          "skinTone": 1
        }
      },
      {
        "emoji": {
          "annotation": "thumbs up",
          "group": 1,
          "order": 351,
          "shortcodes": [
            "+1",
            "thumbsup",
            "yes"
          ],
          "skins": [
            { "tone": 1, "unicode": "👍🏻", "version": 1 },
            { "tone": 2, "unicode": "👍🏼", "version": 1 },
            { "tone": 3, "unicode": "👍🏽", "version": 1 },
            { "tone": 4, "unicode": "👍🏾", "version": 1 },
            { "tone": 5, "unicode": "👍🏿", "version": 1 }
          ],
          "tags": [
            "+1",
            "good",
            "hand",
            "like",
            "thumb",
            "up",
            "yes"
          ],
          "unicode": "👍️",
          "version": 0.6,
          "skinTone": 1
        }
      }
    ];
}
