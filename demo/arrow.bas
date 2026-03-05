REM ==========================================
REM ARROW.BAS - A simple bwxBASIC Game
REM Demonstrate modern features: DICT, FUN, Labels
REM ==========================================

REM --- Constants & Initialization ---
LET W = GR_CANVAS_WIDTH()
LET H = GR_CANVAS_HEIGHT()
LET GRAVITY = 0.5
LET ARROW_LEN = 15

REM --- Setup Turret Position ---
LET TX = 50 + RND(W - 100)
LET TY = H
LET SCORE = 0

RoundStart: REM Initialize Turret & Arrows
DICT ARROW("x", TX, "y", TY, "dx", 0, "dy", 1)REM Generate Balloons (1 to 3)
LET NUM_BALLOONS = 1 + RND(3)
ARRAY BALLOONS(NUM_BALLOONS - 1)
FOR I = 0 TO NUM_BALLOONS - 1
  LET BX = 20 + RND(W - 40)
  LET BY = 20 + RND((H / 2) - 40)
  LET BD = 15 + RND(20)
  LET BC = 32 + RND(60)
  DICT B("x", BX, "y", BY, "dia", BD, "col", BC, "active", 1)
  LET BALLOONS(I) = B
NEXT I

REM --- Main Input Phase ---
InputPhase: GOSUB DrawScene
GOSUB DrawScene

GR_MOVETO 10, 20
GR_COLOR = 7
GR_PRINT "SCORE: " ; SCORE
GR_MOVETO 10, 50
GR_PRINT "ENTER ANGLE (0-180):"
INPUT A

IF A < 0 THEN LET A = 0
IF A > 180 THEN LET A = 180

REM Compute initial velocity based on input angle
REM Angle 90 is straight up, 0 is right, 180 is left. We map standard geometry.
LET RAD = CALL RADIANS(A)

REM Assign start position to Turret nose
ARROW("x") = TX
ARROW("y") = TY - 20

REM Initialize Velocity vector component
ARROW("dx") = 15 * COS(RAD)
ARROW("dy") = -15 * SIN(RAD)

REM --- Shoot & Animate Loop ---
AnimateLoop: REM Apply Physics
REM Apply Physics
ARROW("x") = ARROW("x") + ARROW("dx")
ARROW("y") = ARROW("y") + ARROW("dy")
ARROW("dy") = ARROW("dy") + GRAVITY

REM Draw the Frame
GOSUB DrawScene

REM Draw the Arrow
LET AX = ARROW("x")
LET AY = ARROW("y")
LET ADX = ARROW("dx")
LET ADY = ARROW("dy")

REM Calculate tail of arrow based on velocity vector
REM Normalize ADX/ADY to length ARROW_LEN
LET VLEN = SQR(ADX * ADX + ADY * ADY)
LET N_DX = (ADX / VLEN) * ARROW_LEN
LET N_DY = (ADY / VLEN) * ARROW_LEN

LET TAIL_X = AX - N_DX
LET TAIL_Y = AY - N_DY
GR_COLOR = 7 : REM White Arrow
GR_MOVETO TAIL_X, TAIL_Y
GR_LINETO AX, AY

REM Check Balllons Collision
LET POPPED_THIS_FRAME = 0
LET ACTIVE_COUNT = 0

FOR I = 0 TO NUM_BALLOONS - 1
    LET B = BALLOONS(I)
    IF B("active") = 0 THEN GOTO SkipBalloon

    LET DIST = CALL DISTANCE(AX, AY, B("x"), B("y"))
    IF DIST >= (B("dia") / 2) THEN GOTO MissedBalloon

    B("active") = 0
    LET POPPED_THIS_FRAME = 1
    LET SCORE = SCORE + 10
    GOTO SkipBalloon

MissedBalloon: LET ACTIVE_COUNT = ACTIVE_COUNT + 1

SkipBalloon: NEXT I

REM Pause frame
DELAY 30

REM Condition checks to break animation
IF POPPED_THIS_FRAME = 1 THEN GOTO CheckWin
IF AY > H THEN GOTO InputPhase
IF AX < 0 OR AX > W THEN GOTO InputPhase

GOTO AnimateLoop

CheckWin: IF ACTIVE_COUNT > 0 THEN GOTO AnimateLoop

GR_MOVETO W/2 - 100, H/2
GR_COLOR = 36 : REM Green
GR_PRINT "ROUND CLEARED!"
DELAY 2000
GOTO RoundStart


REM --- Subroutines ---
DrawScene: GR_COLOR = 255 : GR_CLEAR

REM Draw Active Balloons
FOR I = 0 TO NUM_BALLOONS - 1
    LET B = BALLOONS(I)
    IF B("active") = 0 THEN GOTO SkipDrawBalloon

    GR_COLOR = B("col")
    GR_MOVETO B("x"), B("y")
    GR_FELLIPSE B("dia"), B("dia")
    
    REM Draw string
    GR_COLOR = 63 : REM Dark grey
    GR_MOVETO B("x"), B("y") + (B("dia")/2)
    GR_LINETO B("x"), B("y") + (B("dia")/2) + 10

SkipDrawBalloon: NEXT I

REM Draw Turret Base
GR_COLOR = 44 : REM Orange
GR_MOVETO TX - 15, TY
GR_FRECT 30, 20
RETURN


REM --- Helper Functions ---
FUN RADIANS(DEG)
  LET R = DEG * 3.141592653589 / 180.0
RETURN R

FUN DISTANCE(X1, Y1, X2, Y2)
  LET DX = X2 - X1
  LET DY = Y2 - Y1
  LET D = SQR((DX * DX) + (DY * DY))
RETURN D
