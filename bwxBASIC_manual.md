# bwxBASIC Reference Manual

bwxBASIC is a modern web-based implementation of BASIC, inspired by Applesoft BASIC but enhanced with structured graphics commands, modern editing features, and a 256-color palette.

## 1. Variables & Data Types

*   **Real Numbers**: All numbers are floating point.
    *   `A = 3.14`
    *   `C = -50`
*   **Strings**: Text enclosed in double quotes. Variable names must end with `$`.
    *   `N$ = "bwxBASIC"`
*   **Arrays**: Defined with `DIM` for allocation or `ARRAY` for initialization. Zero-indexed.
    *   **Allocation**: `DIM A(10)` (Creates array with 11 array slots, 0-10). Multi-dimensional supported: `DIM MAT(5, 5)`.
    *   **Initialization**: `ARRAY A(1, 2, 3)` (Creates array `A` with elements `A(0)=1, A(1)=2, A(2)=3`).
    *   **Multi-line Parsing**: Unbalanced parentheses allow multi-line initialization without stringing commands together:
        ```basic
        10 ARRAY A(
        20   1, 2, 3
        30 )
        ```
*   **Associative Arrays (Dictionaries)**: Defined with `DICT`.
    *   **Initialization**: `DICT TBL("foo", 10, "bar", 20)`
    *   **Deletion & Missing Keys**: Missing keys resolve to the constant `NIL`. Assigning `NIL` (e.g. `TBL("foo") = NIL`) removes the key.
    *   **Iteration**: Loop through keys using `FORKEYS K, TBL ... NEXT K`.

## 1.5. DATA, READ, and RESTORE

For bulk data loading into Arrays or Dicts, you can embed `DATA` variables in your programs.
*   **DATA**: Stores unexecuted static values in memory. String keys do not require tuples. `DATA 1, 2, "key", 99`.
*   **READ**: Reads `N` items sequentially from `DATA` into an instantiated array or dict. 
    *   **Arguments**: `READ <Variable>, <Count> [, <Start Indices...>]`
    *   *Examples*: 
        *   `READ R_MAT, 10` reads 10 values linearly. 
        *   `READ R_MAT, 10, 2, 0` reads 10 values into a 2D matrix starting at row `2`, column `0`. The index wraps correctly across dimensions.
*   **RESTORE**: Repositions the data pointer.
    *   `RESTORE 50` resets the pointer to read from line `50`.
    *   `RESTORE` with no arguments resets the reading pointer to the very first `DATA` item in the file.

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
*   **Usage**: `INKEY(Mode)` (or `INKEY$(Mode)`)
    *   `Mode 1`: Blocking (wait for key).
    *   `Mode 0`: Non-blocking (return "" if no key).

```basic
10 PRINT "PRESS ANY KEY..."
20 K$ = INKEY(1)
30 IF K$ = "" THEN GOTO 20
40 PRINT "YOU PRESSED: "; K$
```

### DELAY
Pauses execution.
*   **Usage**: `DELAY ms`

```basic
10 PRINT "WAITING..."
20 DELAY 1000
30 PRINT "DONE!"
```

## 3. Control Flow

### IF ... THEN ... ELSE
Conditional execution.
```basic
10 IF A > 10 THEN PRINT "BIG" ELSE PRINT "SMALL"
20 IF Name$ = "BOB" THEN GOTO 100
```

### AND / OR Logical Operators
Combine multiple conditions.
```basic
10 IF A > 10 AND A < 20 THEN PRINT "IN RANGE"
20 IF B = 1 OR B = 2 THEN PRINT "VALID OPTION"
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
Jumping and Subroutines. The target can be a line number, label, or an expression evaluating to a number.
```basic
10 LET X = 100
20 GOSUB X
30 PRINT "Back in Main"
40 END  ' Or STOP
100 PRINT "I am a subroutine"
110 RETURN
```

### ON ... GOTO / ON ... GOSUB
Computed jumps. Evaluates an expression and jumps to the Nth target in the list. If the value is out of bounds (less than 1 or greater than the number of targets), execution continues to the next statement.
```basic
10 INPUT "CHOOSE 1, 2, OR 3: "; C
20 ON C GOTO 100, 200, 300
30 PRINT "INVALID CHOICE"
40 END
100 PRINT "YOU CHOSE 1": END
200 PRINT "YOU CHOSE 2": END
300 PRINT "YOU CHOSE 3": END
```

### Labels & Optional Line Numbers
bwxBASIC allows both traditional line numbers and modern alphanumeric labels. Programs execute top-to-bottom sequentially.
*   **Line Numbers**: Optional. `10 PRINT "HELLO"`
*   **Labels**: End with a colon. `LoopStart:`
*   **GOTO / GOSUB Targets**: Can be line numbers, labels, or even variables containing a target. `GOTO LoopStart`

```basic
LoopStart:
PRINT "Hello"
GOTO LoopStart
```

## 4. Functions

### User Defined Functions (`FUN` and `CALL`)
bwxBASIC supports fully isolated, recursive function executions natively embedded inside mathematical expressions or called directly.
Arguments passed into a `FUN` signature temporarily overwrite global variables of the exact same matching name (acting as local scope). When `RETURN` completes, the exact previous global variable values are flawlessly restored.

```basic
10 LET X = 100
20 LET Z = CALL MYMATH(5, 5)
30 PRINT "X is still "; X ; " and Z is "; Z

100 FUN MYMATH(X, Y)
110    LET TOTAL = X + Y
120 RETURN TOTAL
```

### Math
*   `SIN(X)`, `COS(X)`, `TAN(X)`, `ATN(X)`: Trigonometry (Radians).
*   `SQR(X)`: Square Root.
*   `ABS(X)`: Absolute Value.
*   `INT(X)`: Floor integer.
*   `EXP(X)`, `LOG(X)`: Exponential and Natural Log.
*   `SGN(X)`: Returns 1 (positive), -1 (negative), or 0.
*   `RND(N)`: Random 0 to N.
*   `SEED(N)`: Seed the random number generator.
*   `TIME`: Returns milliseconds since start (high precision).

### String
*   `LEN(S$)`: Length.
*   `LEFT$(S$, N)`: First N chars.
*   `RIGHT$(S$, N)`: Last N chars.
*   `MID$(S$, I, N)`: N chars starting at index I (1-based).
*   `UPPER$(S$)`: Convert string to uppercase.
*   `LOWER$(S$)`: Convert string to lowercase.
*   `STR$(N)`: Convert number to string.
*   `VAL(S$)`: Convert string to number.
*   `ASC(S$)`: ASCII code of first character.
*   `CHR$(N)`: Single-char string from ASCII code.
*   `INSTR([Start], S$, Sub$)`: Returns index (1-based) of substring.

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
*   `GR_RGB(R, G, B)`: Returns the nearest palette color index for given R, G, B values (0-255).

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

bwxBASIC uses a 256-color palette organized by hue and brightness. Colors are accessed via index `0` through `255`. LOAD "demo/palette.bas" to see the complete palette.

## 7. Off-Screen Graphics Buffers

bwxBASIC supports multiple isolated drawing buffers, enabling double-buffering and sophisticated composites. The main screen is permanently `ID 0`.

*   `GR_CANVAS(W, H)`: Clones the state and creates an off-screen canvas. Returns its unique `ID`.
*   `GR_FREE ID`: Destroys the canvas and frees RAM.
*   `GR_SET_CANVAS ID`: Routes all subsequent graphics commands (`GR_COLOR`, `GR_FRECT`, etc) explicitly into this canvas instead of the main screen. 
*   `GR_GET_CANVAS()`: Returns the currently targeted canvas ID.
*   `GR_CANVAS_WIDTH()`, `GR_CANVAS_HEIGHT()`: Returns the dimensions of the currently targeted canvas.
*   `GR_COPY SrcID, X, Y [, W, H]`: Fast copy from `SrcID` onto the currently targeted canvas at `X, Y`. Optional `W, H` allow for image scaling.

**Example: Double Buffering**
```basic
10 X = GR_CANVAS(400, 300)
20 GR_SET_CANVAS X
30 GR_CLS : GR_COLOR = 33 : GR_FRECT 10,10,50,50
40 GR_SET_CANVAS 0   ' Back to main
50 GR_COPY X, 0, 0   ' Blit to screen
60 GR_FREE X
```

## 8. System Commands

*   `RUN`: Execute program.
*   `LIST`: View source code (supports ranges like `LIST 10-50`).
*   `EDIT`: Opens the full-screen integrated code editor.
    *   **Editor Commands**:
        *   Type normally as you would in an IDE.
        *   Standard shortcuts are supported: `Ctrl+C` (Copy), `Ctrl+V` (Paste), `Ctrl+Z` (Undo), `Shift+Ctrl+Z` (Redo).
        *   Syntax is highlighted in real-time.
        *   Click **SAVE & CLOSE** to apply changes and seamlessly rebuild the program array.
*   `EDIT Ln`: Edit a specific line number directly via the REPL prompt string.
*   `NEW`: Clear program and variables.
*   `COPY`: Copy the current program source code to your clipboard.
*   `SAVE "NAME"`: Save to local storage.
*   `LOAD "NAME"`: Load from local storage or demos.
*   `DIR` or `CATALOG`: List files.
*   `DOWNLOAD "NAME"`: Download .BAS file to computer.
*   `WHERE`: Show line number of last stop.
*   `VARS`: Lists all currently defined variables.
*   `READ`: Read values from DATA arrays into variables.
*   `RESTORE`: Reset the data loading pointer to a specific line.
*   `HELP`: Show internal help.
*   `JSECHO`: Toggle console logging (for debugging).
*   `JSPEEK`: See what your BASIC code looks like in JavaScript.
*   `VIZ`: Generates an interactive, zoomable flowchart visualization of your program's basic block structure. Opens in an overlay that can be closed with `<ESC>` or the "Close" button.
