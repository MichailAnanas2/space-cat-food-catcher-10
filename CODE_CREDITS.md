# Code Credits

## Игровая механика и архитектура

Часть архитектурных решений в `game.js` (игровой цикл `requestAnimationFrame`, 
обработка ввода клавиатуры/тача, спавн падающих объектов, рост сложности и 
простая AABB-коллизия) адаптирована из репозитория:

- **Catch-Dodge** by Mehedi Hasan Siddique
- URL: https://github.com/Darkraider888/Catch-Dodge
- License: MIT License
- Copyright (c) 2026 Mehedi Hasan Siddique

Полный текст MIT-лицензии:

```
MIT License

Copyright (c) 2026 Mehedi Hasan Siddique

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Визуальные и звуковые ассеты

- Вся растровая графика (персонажи, бомбы, бонусы, фоны, UI) — сгенерирована
  `ai-grok-assets` специально для проекта `space-cat-food-catcher-10`.
- Аудио — CC0 (public domain) из OpenGameArt:
  - `music_game.ogg` / `music_menu.ogg` — Agecaf, "Out in Space"
  - `sfx_explosion.wav` — TinyWorlds
  - `sfx_dodge.wav` — Macro (Dan Knoflicek)
  - `sfx_collect.wav` — Fupi
  - `sfx_level_up.wav` — qubodup
  - `sfx_game_over.wav` — zuvizu
  - `sfx_ui_click.ogg` / `sfx_ui_confirm.ogg` — Kenney
