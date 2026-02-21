# TODO

- [ ] FEAT: check for .bas extension in LOAD and SAVE commands
- [ ] FEAT: document the color palette
- [ ] FEAT: add support for ON X [GOTO|GOSUB] A, B, C, D
- [ ] FEAT: add link to the repo and the manual in the help screen
- [ ] FEAT: add support for off-screen buffers (GR_CANVAS(W, H) returns a buffer ID, GR_COPY(BUFFER_ID, X, Y, W, H) copies the buffer to the screen, GR_FREE(BUFFER_ID) releases the buffer, GR_SET_CANVAS(BUFFER_ID) sets the buffer as the current canvas, GR_GET_CANVAS() returns the current canvas ID, GR_CANVAS_WIDTH, GR_CANVAS_HEIGHT, GR_SET_CANVAS(0) sets the screen as the current canvas)
- [ ] BUG: `10 DIM G(8,8),C(9,2),K(3,3),N(3),Z(8,8),D(8)` - doesn't parse correctly
- [ ] BUG: COPY command (copies current program to the clipboard) is not documented