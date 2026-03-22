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
LET round = 0

GameStart:
LET score = 0
LET quiver = 5

RoundStart:
round = round + 1
REM turret x, y
LET tx = 50 + RND(w - 100)
LET ty = h - 10
DICT arrow("x", tx, "y", ty, "dx", 0, "dy", 1)

REM Generate Balloons (based on round)
LET num_balloons = round + 1
ARRAY balloons(num_balloons - 1)
FOR i = 0 TO num_balloons - 1
  LET bx = 20 + RND(w - 40)
  LET by = 20 + RND((h / 2) - 40)
  LET bd = 15 + RND(20)
  LET bc = 32 + RND(60)
  DICT b("x", bx, "y", by, "dia", bd, "col", bc, "active", 1)
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
  arrow("y") = ty - 20

  REM Initialize Velocity vector component
  arrow("dx") = 15 * COS(rad)
  arrow("dy") = -15 * SIN(rad)

  REM --- Shoot & Animate Loop ---
  AnimateLoop:
    REM Apply Physics
    arrow("x") = arrow("x") + arrow("dx")
    arrow("y") = arrow("y") + arrow("dy")
    arrow("dy") = arrow("dy") + gravity

    REM Draw the Frame
    GOSUB DrawScene

    REM Draw the Arrow
    LET ax = arrow("x")
    LET ay = arrow("y")
    LET adx = arrow("dx")
    LET ady = arrow("dy")

    REM Calculate tail of arrow based on velocity vector
    REM Normalize adx/ady to length arrow_len
    LET vlen = SQR(adx * adx + ady * ady)
    LET n_dx = (adx / vlen) * arrow_len
    LET n_dy = (ady / vlen) * arrow_len

    LET tail_x = ax - n_dx
    LET tail_y = ay - n_dy
    GR_COLOR = ARROW_COLOR
    GR_MOVETO tail_x, tail_y
    GR_LINETO ax, ay

    REM Check Balllons Collision
    LET popped_this_frame = 0
    LET active_count = 0

    FOR i = 0 TO num_balloons - 1
      DICT b = balloons(i)
      IF b("active") = 0 THEN GOTO SkipBalloon

      LET cx = b("x") + (b("dia") / 2)
      LET cy = b("y") + (b("dia") / 2)
      LET dist = CALL distance(ax, ay, cx, cy)
      IF dist >= (b("dia") / 2) THEN GOTO MissedBalloon

      b("active") = 0
      LET popped_this_frame = 1
      LET score = score + 10
      LET popped_this_shot = popped_this_shot + 1
      GOSUB PopAnimation
      GOSUB AddArrowToQuiver
      IF popped_this_shot = 2 THEN GOSUB AddArrowToQuiver
      GOTO SkipBalloon

      MissedBalloon: LET active_count = active_count + 1

    SkipBalloon:
    NEXT i

  REM Pause frame
  DELAY 30

  REM Condition checks to break animation
  IF popped_this_frame = 1 THEN GOTO CheckWin
  IF ay > h THEN GOTO InputPhase
  IF ax < 0 OR ax > w THEN GOTO InputPhase

GOTO AnimateLoop

CheckWin:
  IF active_count > 0 THEN GOTO AnimateLoop

  GOSUB AddArrowToQuiver
  GOSUB AddArrowToQuiver

GR_MOVETO w/2 - 100, h/2
GR_COLOR = 115 : REM Green
GR_PRINT "ROUND CLEARED!"
DELAY 2000
GOTO RoundStart


REM --- Subroutines ---
DrawScene:
  GR_COLOR = 255 : GR_CLEAR
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
  LET q_start_x = w - (20 * 14) - 20
  LET qx = q_start_x + (quiver * 14)
  LET qy = 12

  FOR sf = 1 TO 3
    GR_COLOR = 64 : REM lavender sparks
    FOR sp = 0 TO 7
      LET spr = CALL radians(sp * 45)
      LET spdx = COS(spr) * (sf * 4) + 5
      LET spdy = SIN(spr) * (sf * 4) + 5
      GR_MOVETO qx + spdx, qy + spdy
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
