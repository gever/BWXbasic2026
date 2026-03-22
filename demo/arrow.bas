REM ==========================================
REM ARROW.BAS - A simple bwxBASIC Game
REM Demonstrate modern features: DICT, FUN, Labels
REM ==========================================

CLS

REM --- Constants & Initialization ---
LET w = GR_CANVAS_WIDTH
LET h = GR_CANVAS_HEIGHT
LET TEXT_YELLOW = 152 : LET ARROW_COLOR = 156 : LET STRING_COLOR = 63
LET gravity = 0.5
LET arrow_len = 8

LET trail_canvas = GR_CANVAS(w, h)
GR_SET_CANVAS trail_canvas
GR_COLOR = 230 : GR_CLEAR
GR_SET_CANVAS 0

GameStart:
LET score = 0
LET quiver = 5
LET round = 0

RoundStart:
round = round + 1
GR_SET_CANVAS trail_canvas
GR_COLOR = 230 : GR_CLEAR
GR_SET_CANVAS 0

REM turret x, y
LET tx = 50 + RND(w - 100)
LET ty = h - 10
DICT arrow("x", tx, "y", ty, "dx", 0, "dy", 1)

REM Generate Balloons (based on round)
LET num_balloons = round + 1
IF num_balloons > 10 THEN LET num_balloons = 10
ARRAY balloons(num_balloons - 1)
FOR i = 0 TO num_balloons - 1
  LET bx = 20 + RND(w - 40)
  LET by = 20 + RND((h / 2) - 40)
  LET bd = 15 + RND(20)
  LET bc = 32 + RND(60)
  LET btype = 0
  IF round > 3 AND RND(100) < 30 THEN LET bc = 255 : LET btype = 1
  DICT b("x", bx, "y", by, "dia", bd, "col", bc, "active", 1, "type", btype)
  LET balloons(i) = b
NEXT i

REM --- Main Input Phase ---
InputPhase:
  IF quiver <= 0 THEN GOTO GameOver
  GOSUB DrawScene

  GR_FONT 16 : GR_COLOR = TEXT_YELLOW
  GR_MOVETO 10, h-40 : GR_PRINT "BALLOONS: "; num_balloons
  GR_MOVETO 10, h-30 : GR_PRINT "SCORE: " ; score
  GR_MOVETO 10, h-55 : GR_PRINT "ENTER ANGLE (0-180):"
  SETPOS 15, SYS("ROWS") - 3 : INPUT a
  if a < 0 OR a > 180 THEN GOTO InputPhase

  LET quiver = quiver - 1
  LET popped_this_shot = 0

  IF a < 0 THEN a = 0
  IF a > 180 THEN a = 180

  REM Compute initial velocity based on input angle
  REM Angle 90 is straight up, 0 is right, 180 is left. We map standard geometry.
  LET rad = CALL radians(a)

  REM Assign start position to Turret nose
  arrow("x") = tx
  arrow("y") = ty - 5

  REM Initialize Velocity vector component
  arrow("dx") = 15 * COS(rad)
  arrow("dy") = -15 * SIN(rad)

  REM --- Shoot & Animate Loop ---
  AnimateLoop:
    LET popped_this_frame = 0
    LET active_count = 0

    FOR sub = 1 TO 3
      REM Apply Physics
      LET gx = arrow("x")
      LET gy = arrow("y")

      REM Apply Black hole gravity
      FOR i = 0 TO num_balloons - 1
        DICT b = balloons(i)
        IF b("active") = 0 THEN GOTO SkipGravity
        IF b("type") = 0 THEN GOTO SkipGravity
        
        LET cx = b("x") + (b("dia") / 2)
        LET cy = b("y") + (b("dia") / 2)
        LET dist = CALL distance(gx, gy, cx, cy)
        IF dist < 5 THEN dist = 5
        LET force_mag = 2500 / (dist * dist)
        LET dt = 0.5
        LET pull_dx = ((cx - gx) / dist) * force_mag * dt
        LET pull_dy = ((cy - gy) / dist) * force_mag * dt
        arrow("dx") = arrow("dx") + pull_dx
        arrow("dy") = arrow("dy") + pull_dy
        
        SkipGravity:
      NEXT i

      LET dt = 0.25
      arrow("x") = arrow("x") + (arrow("dx") * dt)
      arrow("y") = arrow("y") + (arrow("dy") * dt)
      arrow("dy") = arrow("dy") + (gravity * dt)

      REM Draw trail
      GR_SET_CANVAS trail_canvas
      GR_COLOR 168
      GR_MOVETO arrow("x"), arrow("y")
      GR_FRECT 1, 1
      GR_SET_CANVAS 0

      LET ax = arrow("x")
      LET ay = arrow("y")
      LET active_count = 0

      REM Check Balllons Collision
      FOR i = 0 TO num_balloons - 1
        DICT b = balloons(i)
        IF b("active") = 0 THEN GOTO SkipSubBalloon

        LET cx = b("x") + (b("dia") / 2)
        LET cy = b("y") + (b("dia") / 2)
        LET dist = CALL distance(ax, ay, cx, cy)
        IF dist >= (b("dia") / 2) THEN GOTO MissedSubBalloon

        IF b("type") = 0 THEN GOTO SkipBlackHole
        GR_SET_CANVAS trail_canvas
        GR_COLOR = 5
        GR_MOVETO b("x") - 2, b("y") - 2
        GR_ELLIPSE b("dia") + 4, b("dia") + 4
        GR_SET_CANVAS 0
        GOTO ArrowConsumed

        SkipBlackHole:
        b("active") = 0
        LET popped_this_frame = 1
        LET score = score + 10
        LET popped_this_shot = popped_this_shot + 1
        GOSUB PopAnimation
        GOSUB AddArrowToQuiver
        IF popped_this_shot = 2 THEN GOSUB AddArrowToQuiver
        GOTO SkipSubBalloon

        MissedSubBalloon:
        IF b("type") = 0 THEN LET active_count = active_count + 1

        SkipSubBalloon:
      NEXT i

      IF popped_this_frame = 1 THEN GOTO BreakSub
      IF ay > h THEN GOTO BreakSub
      IF ax < 0 OR ax > w THEN GOTO BreakSub
    NEXT sub

    BreakSub:

    REM Draw the Frame
    GOSUB DrawScene

    REM Draw the Arrow
    LET adx = arrow("dx")
    LET ady = arrow("dy")

    REM Calculate tail of arrow based on velocity vector
    LET vlen = SQR(adx * adx + ady * ady)
    LET n_dx = (adx / vlen) * arrow_len
    LET n_dy = (ady / vlen) * arrow_len

    LET tail_x = ax - n_dx
    LET tail_y = ay - n_dy
    GR_COLOR = ARROW_COLOR
    GR_MOVETO tail_x, tail_y
    GR_LINETO ax, ay

    REM Pause frame
    DELAY 30

    REM Condition checks to break animation
    IF popped_this_frame = 1 THEN GOTO CheckWin
    IF ay > h THEN GOTO InputPhase
    IF ax < 0 OR ax > w THEN GOTO InputPhase

  GOTO AnimateLoop

ArrowConsumed:
  LET active_count = 0
  FOR i = 0 TO num_balloons - 1
    DICT b = balloons(i)
    IF b("active") = 1 AND b("type") = 0 THEN LET active_count = active_count + 1
  NEXT i
  IF active_count = 0 THEN GOTO RoundCleared
  GOTO InputPhase

CheckWin:
  IF active_count > 0 THEN GOTO AnimateLoop

RoundCleared:
  GOSUB AddArrowToQuiver

GR_MOVETO w/2 - 100, h/2
GR_COLOR = 115 : REM Green
GR_PRINT "ROUND CLEARED!"
DELAY 2000
GOTO RoundStart


REM --- Subroutines ---
DrawScene:
  GR_COPY trail_canvas, 0, 0
  GOSUB DrawQuiver

  REM Draw Active Balloons
  FOR di = 0 TO num_balloons - 1
    DICT db = balloons(di)
    IF db("active") = 0 THEN GOTO SkipDrawBalloon

    bx = db("x") : by = db("y") : dia = db("dia")
    ' balloon
    GR_COLOR = db("col")
    GR_MOVETO bx, by
    GR_FELLIPSE dia, dia

    IF db("type") = 1 THEN GOTO SkipDrawBalloon

    ' knot
    GR_MOVETO bx + (dia/2), by + dia
    GR_FTRI bx + (dia/2) - 4, by + dia + 6, bx + (dia/2) + 4, by + dia + 6

    ' string
    GR_COLOR = STRING_COLOR
    GR_MOVETO bx + (dia/2), by + dia
    GR_LINETO bx + (dia/2), by + dia + 10

    SkipDrawBalloon:
  NEXT di

  REM Draw Turret Base
  GR_COLOR = 44 : REM Orange
  GR_MOVETO tx - 15, ty
  GR_FRECT 30, 20
RETURN

DrawQuiver:
  LET q_start_x = w - (20 * 14) - 20
  FOR qi = 1 TO 20
    LET qx = q_start_x + (qi * 14)
    LET qy = 12
    GR_COLOR = 127
    GR_MOVETO qx, qy
    GR_ELLIPSE 10, 10

    IF qi > quiver THEN GOTO SkipQuiverFill

    LET qc = 216
    ' IF qi <= 10 THEN qc = 216
    ' IF qi <= 5 THEN qc = 221

    GR_COLOR = qc
    GR_MOVETO qx, qy
    GR_FELLIPSE 10, 10

    SkipQuiverFill:
  NEXT qi
RETURN

AddArrowToQuiver:
  IF quiver >= 20 THEN RETURN
  LET quiver = quiver + 1

  REM Spark highlight
  LET aq_start_x = w - (20 * 14) - 20
  LET aqx = aq_start_x + (quiver * 14)
  LET aqy = 12

  FOR sf = 1 TO 3
    GR_COLOR = 64 : REM lavender sparks
    FOR sp = 0 TO 7
      LET spr = CALL radians(sp * 45)
      LET spdx = COS(spr) * (sf * 4) + 5
      LET spdy = SIN(spr) * (sf * 4) + 5
      GR_MOVETO aqx + spdx, aqy + spdy
      GR_FELLIPSE 2, 2
    NEXT sp
    DELAY 20
    GOSUB DrawScene
  NEXT sf
RETURN

GameOver:
  GR_FONT 40
  GR_MOVETO w/2 - 80, h/2
  GR_COLOR = 158 : REM Red
  GR_PRINT "OUT OF ARROWS!"
  GR_FONT 26
  DELAY 3000
  GOTO GameStart

PopAnimation:
  REM b is already the active balloon dict
  LET px = b("x") + (b("dia") / 2)
  LET py = b("y") + (b("dia") / 2)
  LET pc = b("col")

  FOR f = 1 TO 5
    GOSUB DrawScene

    GR_COLOR = pc
    FOR p = 0 TO 7
      LET pr = CALL radians(p * 45)
      LET pdx = COS(pr) * (f * 4)
      LET pdy = SIN(pr) * (f * 4)
      GR_MOVETO px + pdx, py + pdy
      GR_FELLIPSE 3, 3
    NEXT p

    DELAY 30
  NEXT f
RETURN


REM --- Helper Functions ---
FUN radians(deg)
  LET r = deg * 3.141592653589 / 180.0
RETURN r

FUN distance(x1, y1, x2, y2)
  LET dx = x2 - x1
  LET dy = y2 - y1
  LET d = SQR((dx * dx) + (dy * dy))
RETURN d
