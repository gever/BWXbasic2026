# TODO

- [ ] FEAT: check for .bas extension in LOAD and SAVE commands
- [ ] FEAT: document the color palette
- [X] FEAT: add support for ON X [GOTO|GOSUB] A, B, C, D
- [X] FEAT: add link to the repo and the manual in the help screen
- [X] FEAT: add support for off-screen buffers (GR_CANVAS(W, H) returns a buffer ID, GR_COPY(BUFFER_ID, X, Y, W, H) copies the buffer to the screen, GR_FREE(BUFFER_ID) releases the buffer, GR_SET_CANVAS(BUFFER_ID) sets the buffer as the current canvas, GR_GET_CANVAS() returns the current canvas ID, GR_CANVAS_WIDTH, GR_CANVAS_HEIGHT, GR_SET_CANVAS(0) sets the screen as the current canvas)
- [X] BUG: ```10 DIM G(8,8),C(9,2),K(3,3),N(3),Z(8,8),D(8)``` - doesn't parse correctly
- [X] BUG: COPY command (copies current program to the clipboard) is not documented
- [ ] BUG: pasting code in from Linux does something weird at end of line
- [X] BUG: REPL scrolling is inconsistent
- [ ] FEAT: Uppercase all input (except quoted strings), keep canonical BASIC formatting internally, show user canonical even if the paste or edit in lowercase
- [X] BUG: ```10 A$ = INKEY$(1)``` is generating an error at runtime
- [X] FEAT: save code to CURRENT.BAS before running it
- [ ] FEAT: add support for GR_RGB R, G, B (0-255) to set the current color
- [ ] FEAT: accept '?' as shorthand for PRINT
- [ ] BUG: NEW should reset ENGINE.lastExecLine to zero
- [ ] BUG: FUN body should be indented in the listing (and the editor?)
- [X] BUG: GR_CANVAS_WIDTH and GR_CANVAS_HEIGHT (and other parameterless functions) are not working in math expressions.
- [X] BUG: REPL doesn't keep track of the current filename (LOAD/SAVE/NEW not setting/using FS.currentFilename appropriately)