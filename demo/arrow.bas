REM ==========================================
REM ARROW.BAS - A simple bwxBASIC Game
REM Demonstrate modern features: DICT, FUN, Labels
REM ==========================================

REM --- Constants & Initialization ---
LET w = GR_CANVAS_WIDTH
LET h = GR_CANVAS_HEIGHT
LET gravity = 0.5
LET arrow_len = 15

REM --- Setup Turret Position ---
LET tx = 50 + RND(w - 100)
LET ty = h - 10
LET score = 0

RoundStart: REM Initialize Turret & Arrows
DICT arrow("x", tx, "y", ty, "dx", 0, "dy", 1) : REM Generate Balloons (1 to 3)
LET num_balloons = INT(1 + RAND(3))
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
  GOSUB DrawScene

  GR_MOVETO 10, 20
  GR_COLOR = 7
  GR_PRINT "SCORE: " ; score
  GR_MOVETO 10, 50
  GR_PRINT "ENTER ANGLE (0-180):"
  INPUT a

  IF a < 0 THEN LET a = 0
  IF a > 180 THEN LET a = 180

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
    GR_COLOR = 7 : REM White Arrow
    GR_MOVETO tail_x, tail_y
    GR_LINETO ax, ay

    REM Check Balllons Collision
    LET popped_this_frame = 0
    LET active_count = 0

    FOR i = 0 TO num_balloons - 1
      LET b = balloons(i)
      IF b("active") = 0 THEN GOTO SkipBalloon

      LET dist = CALL distance(ax, ay, b("x"), b("y"))
      IF dist >= (b("dia") / 2) THEN GOTO MissedBalloon

      b("active") = 0
      LET popped_this_frame = 1
      LET score = score + 10
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

GR_MOVETO w/2 - 100, h/2
GR_COLOR = 36 : REM Green
GR_PRINT "ROUND CLEARED!"
DELAY 2000
GOTO RoundStart


REM --- Subroutines ---
DrawScene:
  GR_COLOR = 255 : GR_CLEAR

  REM Draw Active Balloons
  FOR i = 0 TO num_balloons - 1
    LET b = balloons(i)
    IF b("active") = 0 THEN GOTO SkipDrawBalloon

    GR_COLOR = b("col")
    GR_MOVETO b("x"), b("y")
    GR_FELLIPSE b("dia"), b("dia")
    
    REM Draw string
    GR_COLOR = 63 : REM Dark grey
    GR_MOVETO b("x") + (b("dia")/2), b("y") + b("dia")
    GR_LINETO b("x") + (b("dia")/2), b("y") + b("dia") + 10

  SkipDrawBalloon:
  NEXT i

  REM Draw Turret Base
  GR_COLOR = 44 : REM Orange
  GR_MOVETO tx - 15, ty
  GR_FRECT 30, 20
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
