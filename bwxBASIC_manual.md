# bwxBASIC Reference Manual

bwxBASIC is a modern web-based implementation of BASIC, inspired by Applesoft BASIC but enhanced with structured graphics commands, modern editing features, and a 256-color palette.

## 1. Variables & Data Types

*   **Real Numbers**: All numbers are floating point.
    *   `A = 3.14`
    *   `C = -50`
*   **Strings**: Text enclosed in double quotes. Variable names must end with `$`.
    *   `N$ = "bwxBASIC"`
*   **Arrays**: Defined with `DIM`. Zero-indexed.
    *   `DIM A(10)` (Create array with 11 array slots, 0-10)
    *   `A(0) = 99`
    *   **Array Initialization**: Arrays can be pre-filled using `=` instead of `()`.
        *   `DIM B = 1, 2, 3` (Creates array `B` with elements `B(0)=1, B(1)=2, B(2)=3`)
    *   **Appending (DATA)**: Appends values to the most recently `DIM` declared array.
        *   `DATA 4, 5, 6` (Appends values `4, 5, 6` extending the previous array to size 6)
*   **Associative Arrays (Dictionaries)**: Defined with `DICT`.
    *   **Initialization**: `DICT TBL = ("foo", 10), ("bar", 20)`
    *   **Appending (DATA)**: Appends pairs to the last `DICT`. `DATA ("baz", 30)`
    *   **Deletion & Missing Keys**: Missing keys resolve to the constant `NIL`. Assigning `NIL` (e.g. `TBL("foo") = NIL`) removes the key.
    *   **Iteration**: Loop through keys using `FORKEYS K, TBL ... NEXT K`.

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
Jumping and Subroutines. The target can be a line number, label, or an expression evaluating to a number.
```basic
10 LET X = 100
20 GOSUB X
30 PRINT "Back in Main"
40 END
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


## 7. System Commands

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
*   `DIR`: List files.
*   `DOWNLOAD "NAME"`: Download .BAS file to computer.
*   `WHERE`: Show line number of last stop.
*   `VARS`: Lists all currently defined variables.
*   `HELP`: Show internal help.
*   `JSECHO`: Toggle console logging (for debugging).
*   `JSPEEK`: See what your BASIC code looks like in JavaScript.
