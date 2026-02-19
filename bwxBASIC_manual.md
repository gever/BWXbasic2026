# bwxBASIC Reference Manual

bwxBASIC is a modern web-based implementation of BASIC, inspired by Applesoft BASIC but enhanced with structured graphics commands, modern editing features, and a 64-color palette.

## 1. Variables & Data Types

*   **Real Numbers**: All numbers are floating point.
    *   `A = 3.14`
    *   `C = -50`
*   **Strings**: Text enclosed in double quotes. Variable names must end with `$`.
    *   `N$ = "bwxBASIC"`
*   **Arrays**: Defined with `DIM`. Zero-indexed.
    *   `DIM A(10)` (Create array with 11 slots, 0-10)
    *   `A(0) = 99`

## 2. Input / Output

### PRINT
Prints text or numbers to the screen.
*   **Usage**: `PRINT [Expression] [;|,] [Expression] ...`
*   **Modifiers**:
    *   `;` (Semicolon): Keeps cursor on the same line (concatenates).
    *   `,` (Comma): Inserts a tab/space.

```basic
10 PRINT "HELLO WORLD"
20 PRINT "X = "; X
30 PRINT "A", "B", "C"
```

### INPUT
prompts the user to enter a value.
*   **Usage**: `INPUT ["Prompt";] Variable`

```basic
10 INPUT "NAME? "; N$
20 PRINT "HELLO "; N$
```

### INKEY
Reads a single character from the keyboard.
*   **Usage**: `INKEY(Mode)`
    *   `Mode 1`: Blocking (wait for key).
    *   `Mode 0`: Non-blocking (return "" if no key).

```basic
10 PRINT "PRESS ANY KEY..."
20 K$ = INKEY(1)
30 IF K$ = "" THEN GOTO 20
40 PRINT "YOU PRESSED: "; K$
```

## 3. Control Flow

### IF ... THEN ... ELSE
Conditional execution.
```basic
10 IF A > 10 THEN PRINT "BIG" ELSE PRINT "SMALL"
20 IF Name$ = "BOB" THEN GOTO 100
```

### FOR ... NEXT
Loops.
```basic
10 FOR I = 1 TO 10
20   PRINT I
30 NEXT I
```
With STEP:
```basic
10 FOR I = 10 TO 0 STEP -1
20   PRINT I
30 NEXT I
```

### GOTO / GOSUB / RETURN
Jumping and Subroutines.
```basic
10 PRINT "Main Program"
20 GOSUB 100
30 PRINT "Back in Main"
40 END
100 PRINT "I am a subroutine"
110 RETURN
```

## 4. Functions

### Math
*   `SIN(X)`, `COS(X)`, `TAN(X)`, `ATN(X)`: Trigonometry (Radians).
*   `SQR(X)`: Square Root.
*   `ABS(X)`: Absolute Value.
*   `INT(X)`: Floor integer.
*   `EXP(X)`, `LOG(X)`: Exponential and Natural Log.
*   `RND(N)`: Random 0 to N.
*   `SEED(N)`: Seed the random number generator.
*   `TIME`: Returns milliseconds since start (high precision).

### String
*   `LEN(S$)`: Length.
*   `LEFT$(S$, N)`: First N chars.
*   `RIGHT$(S$, N)`: Last N chars.
*   `MID$(S$, I, N)`: N chars starting at index I (1-based).
*   `STR$(N)`: Convert number to string.
*   `VAL(S$)`: Convert string to number.

## 5. Graphics Commands

bwxBASIC features a vector-like graphics API with a stateful "turtle" cursor.

*   `GR_CLEAR`: Clears screen to current color.
*   `GR_COLOR = C`: Sets current drawing color (0-63).
*   `GR_MOVETO X, Y`: Moves the graphics cursor (pen) to X, Y.
*   `GR_LINETO X, Y`: Draws a line from current position to X, Y.
*   `GR_RECT W, H`: Draws an outline rectangle.
*   `GR_FRECT W, H`: Draws a filled rectangle.
*   `GR_ELLIPSE W, H`: Draws an outline ellipse.
*   `GR_FELLIPSE W, H`: Draws a filled ellipse.
*   `GR_TRI X2,Y2,X3,Y3`: Draws triangle from current pos to (X2,Y2) and (X3,Y3).
*   `GR_FTRI X2,Y2,X3,Y3`: Draws filled triangle.
*   `GR_PRINT Expr`: Prints text at the graphical cursor position.
*   `GR_FONT Size`: Sets the font size for `GR_PRINT` (default 26).

**Example:**
```basic
10 GR_COLOR = 63 : GR_CLEAR  : ' Clear to Black
20 GR_COLOR = 33 : ' Red
30 GR_MOVETO 100, 100
40 GR_LINETO 200, 200
50 GR_COLOR = 36 : ' Green
60 GR_FRECT 50, 50 : ' Draw rect at 200,200
70 GR_COLOR = 7  : ' White
80 GR_PRINT "GRAPHICS!"
```

## 6. Color Palette

bwxBASIC uses a 64-color palette organized by hue and brightness. Colors are accessed via index `0` through `63`.

*   **Rows (0-7)**: Brightness gradient (Top=Light, Bottom=Dark).
*   **Cols (0-6)**: Rainbow hues (Right=Red, Left=Violet).
*   **Col 7**: Grayscale (Top=White, Bottom=Black).

| Index | Col 0 | Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 | Col 7 (Gray) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Row 0** | <span style="background-color:#ffccff">0</span> | <span style="background-color:#ffcccc">1</span> | <span style="background-color:#ffcc99">2</span> | <span style="background-color:#ffffcc">3</span> | <span style="background-color:#ccffcc">4</span> | <span style="background-color:#ccffff">5</span> | <span style="background-color:#ccccff">6</span> | <span style="background-color:#ffffff">7</span> |
| **Row 1** | <span style="background-color:#ff99ff">8</span> | <span style="background-color:#ff9999">9</span> | <span style="background-color:#ffcc66">10</span> | <span style="background-color:#ffff99">11</span> | <span style="background-color:#99ff99">12</span> | <span style="background-color:#99ffff">13</span> | <span style="background-color:#9999ff">14</span> | <span style="background-color:#ebebeb">15</span> |
| **Row 2** | <span style="background-color:#ff66ff">16</span> | <span style="background-color:#ff6666">17</span> | <span style="background-color:#ff9933">18</span> | <span style="background-color:#ffff66">19</span> | <span style="background-color:#66ff66">20</span> | <span style="background-color:#66ffff">21</span> | <span style="background-color:#6666ff">22</span> | <span style="background-color:#d0d0d0">23</span> |
| **Row 3** | <span style="background-color:#ff33ff">24</span> | <span style="background-color:#ff3333">25</span> | <span style="background-color:#ff6600">26</span> | <span style="background-color:#ffff33">27</span> | <span style="background-color:#33ff33">28</span> | <span style="background-color:#33ffff">29</span> | <span style="background-color:#3333ff">30</span> | <span style="background-color:#b5b5b5">31</span> |
| **Row 4** | <span style="background-color:#ff00ff">32</span> | <span style="background-color:#ff0000">33</span> | <span style="background-color:#cc3300">34</span> | <span style="background-color:#cccc00">35</span> | <span style="background-color:#00cc00">36</span> | <span style="background-color:#00cccc">37</span> | <span style="background-color:#0000ff">38</span> | <span style="background-color:#919191">39</span> |
| **Row 5** | <span style="background-color:#cc00cc">40</span> | <span style="background-color:#cc0000">41</span> | <span style="background-color:#993300">42</span> | <span style="background-color:#999900">43</span> | <span style="background-color:#009900">44</span> | <span style="background-color:#009999">45</span> | <span style="background-color:#0000cc">46</span> | <span style="background-color:#696969">47</span> |
| **Row 6** | <span style="background-color:#990099">48</span> | <span style="background-color:#990000">49</span> | <span style="background-color:#663300">50</span> | <span style="background-color:#666600">51</span> | <span style="background-color:#006600">52</span> | <span style="background-color:#006666">53</span> | <span style="background-color:#000099">54</span> | <span style="background-color:#363636">55</span> |
| **Row 7** | <span style="background-color:#660066">56</span> | <span style="background-color:#660000">57</span> | <span style="background-color:#330000">58</span> | <span style="background-color:#333300">59</span> | <span style="background-color:#003300">60</span> | <span style="background-color:#003333">61</span> | <span style="background-color:#000066">62</span> | <span style="background-color:#000000">63</span> |

*(Note: Colors above are approximations generated by the HSL algorithm)*

## 7. System Commands

*   `RUN`: Execute program.
*   `LIST`: View source code (supports ranges like `LIST 10-50`).
*   `EDIT Ln`: Edit a specific line number.
*   `NEW`: Clear program and variables.
*   `SAVE "NAME"`: Save to local storage.
*   `LOAD "NAME"`: Load from local storage or demos.
*   `DIR`: List files.
*   `DOWNLOAD "NAME"`: Download .BAS file to computer.
*   `WHERE`: Show line number of last stop.
*   `VARS`: Lists all currently defined variables.
*   `HELP`: Show internal help.
*   `JSECHO`: Toggle console logging (for debugging).
*   `JSPEEK`: See what your BASIC code looks like in JavaScript.
