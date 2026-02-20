# TODO

- [ ] check for .bas extension in LOAD and SAVE commands
- [ ] document the color palette
- [ ] add support for ON X [GOTO|GOSUB] A, B, C, D
- [ ] add link to the repo and the manual in the help screen
- [ ] add support for off-screen buffers (GR_CANVAS(W, H) returns a buffer ID, GR_COPY(BUFFER_ID, X, Y, W, H) copies the buffer to the screen, GR_FREE(BUFFER_ID) releases the buffer, GR_SET_CANVAS(BUFFER_ID) sets the buffer as the current canvas, GR_GET_CANVAS() returns the current canvas ID, GR_GET_CANVAS_WIDTH(), GR_GET_CANVAS_HEIGHT(), GR_SET_CANVAS(0) sets the screen as the current canvas)