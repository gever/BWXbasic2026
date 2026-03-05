10 REM ==========================================
20 REM ARROW.BAS - A simple bwxBASIC Game
30 REM Demonstrate modern features: DICT, FUN, Labels
40 REM ==========================================

50 CLS

60 REM --- Constants & Initialization ---
70 LET w = GR_CANVAS_WIDTH
80 LET h = GR_CANVAS_HEIGHT
90 LET TEXT_YELLOW = 152 : LET ARROW_COLOR = 156 : LET STRING_COLOR = 63
100 LET gravity = 0.5
110 LET arrow_len = 8
120 LET score = 0

130 REM RoundStart
140 REM Initialize Turret & Arrow
150 LET tx = 50 + RND(w - 100)
160 LET ty = h - 10
170 LET score = 0

180 REM Initialize Turret & Arrows
190 DICT arrow("x", tx, "y", ty, "dx", 0, "dy", 1)

200 REM Generate Balloons (1 to 3)
210 LET num_balloons = 3 : ' INT(1 + RAND(3))
220 ARRAY balloons(num_balloons - 1)
230 FOR i = 0 TO num_balloons - 1
240 LET bx = 20 + RND(w - 40)
250 LET by = 20 + RND((h / 2) - 40)
260 LET bd = 15 + RND(20)
270 LET bc = 32 + RND(60)
280 DICT b("x", bx, "y", by, "dia", bd, "col", bc, "active", 1)
290 LET balloons(i) = b
300 NEXT i

310 REM --- Main Input Phase ---
320 REM InputPhase
330 GOSUB 1060

340 GR_FONT 16 : GR_COLOR = TEXT_YELLOW
350 GR_MOVETO 10, 12 : GR_PRINT "balloons: "; num_balloons
360 GR_MOVETO 10, 20 : GR_PRINT "SCORE: " ; score
370 GR_MOVETO 10, 28 : GR_PRINT "ENTER ANGLE (0-180):"
380 SETPOS 15, 3 : INPUT a

390 IF a < 0 THEN a = 0
400 IF a > 180 THEN a = 180

410 REM Compute initial velocity based on input angle
420 REM Angle 90 is straight up, 0 is right, 180 is left. We map standard geometry.
430 LET rad = CALL radians(a)

440 REM Assign start position to Turret nose
450 arrow("x") = tx
460 arrow("y") = ty - 20

470 REM Initialize Velocity vector component
480 arrow("dx") = 15 * COS(rad)
490 arrow("dy") = -15 * SIN(rad)

500 REM --- Shoot & Animate Loop ---
510 REM AnimateLoop
520 REM Apply Physics
530 arrow("x") = arrow("x") + arrow("dx")
540 arrow("y") = arrow("y") + arrow("dy")
550 arrow("dy") = arrow("dy") + gravity

560 REM Draw the Frame
570 GOSUB 1060

580 REM Draw the Arrow
590 LET ax = arrow("x")
600 LET ay = arrow("y")
610 LET adx = arrow("dx")
620 LET ady = arrow("dy")

630 REM Calculate tail of arrow based on velocity vector
640 REM Normalize adx/ady to length arrow_len
650 LET vlen = SQR(adx * adx + ady * ady)
660 LET n_dx = (adx / vlen) * arrow_len
670 LET n_dy = (ady / vlen) * arrow_len

680 LET tail_x = ax - n_dx
690 LET tail_y = ay - n_dy
700 GR_COLOR = ARROW_COLOR
710 GR_MOVETO tail_x, tail_y
720 GR_LINETO ax, ay

730 REM Check Balllons Collision
740 LET popped_this_frame = 0
750 LET active_count = 0

760 FOR i = 0 TO num_balloons - 1
770 DICT b = balloons(i)
780 IF b("active") = 0 THEN GOTO 890

790 LET cx = b("x") + (b("dia") / 2)
800 LET cy = b("y") + (b("dia") / 2)
810 LET dist = CALL distance(ax, ay, cx, cy)
820 IF dist >= (b("dia") / 2) THEN GOTO 880

830 b("active") = 0
840 LET popped_this_frame = 1
850 LET score = score + 10
860 GOSUB 1310
870 GOTO 890

880 LET active_count = active_count + 1

890 REM SkipBalloon
900 NEXT i

910 REM Pause frame
920 DELAY 30

930 REM Condition checks to break animation
940 IF popped_this_frame = 1 THEN GOTO 980
950 IF ay > h THEN GOTO 320
960 IF ax < 0 OR ax > w THEN GOTO 320

970 GOTO 510

980 REM CheckWin
990 IF active_count > 0 THEN GOTO 510

1000 GR_MOVETO w/2 - 100, h/2
1010 GR_COLOR = 36 : REM Green
1020 GR_PRINT "ROUND CLEARED!"
1030 DELAY 2000
1040 GOTO 180


1050 REM --- Subroutines ---
1060 REM DrawScene
1070 GR_COLOR = 255 : GR_CLEAR

1080 REM Draw Active Balloons 
1090 FOR i = 0 TO num_balloons - 1
1100 DICT b = balloons(i)
1110 IF b("active") = 0 THEN GOTO 1240

1120 bx = b("x") : by = b("y") : dia = b("dia")
1130 ' balloon
1140 GR_COLOR = b("col")
1150 GR_MOVETO bx, by
1160 GR_FELLIPSE dia, dia

1170 ' knot
1180 GR_MOVETO bx + (dia/2), by + dia
1190 GR_FTRI bx + (dia/2) - 4, by + dia + 6, bx + (dia/2) + 4, by + dia + 6

1200 ' string
1210 GR_COLOR = STRING_COLOR
1220 GR_MOVETO bx + (dia/2), by + dia
1230 GR_LINETO bx + (dia/2), by + dia + 10

1240 REM SkipDrawBalloon
1250 NEXT i

1260 REM Draw Turret Base
1270 GR_COLOR = 44 : REM Orange
1280 GR_MOVETO tx - 15, ty
1290 GR_FRECT 30, 20
1300 RETURN

1310 REM PopAnimation
1320 REM b is already the active balloon dict
1330 LET px = b("x") + (b("dia") / 2)
1340 LET py = b("y") + (b("dia") / 2)
1350 LET pc = b("col")

1360 FOR f = 1 TO 5
1370 GOSUB 1060
    
1380 GR_COLOR = pc
1390 FOR p = 0 TO 7
1400 LET pr = CALL radians(p * 45)
1410 LET pdx = COS(pr) * (f * 4)
1420 LET pdy = SIN(pr) * (f * 4)
1430 GR_MOVETO px + pdx, py + pdy
1440 GR_FELLIPSE 3, 3
1450 NEXT p
    
1460 DELAY 30
1470 NEXT f
1480 RETURN


1490 REM --- Helper Functions ---
1500 FUN radians(deg)
1510 LET r = deg * 3.141592653589 / 180.0
1520 RETURN r

1530 FUN distance(x1, y1, x2, y2)
1540 LET dx = x2 - x1
1550 LET dy = y2 - y1
1560 LET d = SQR((dx * dx) + (dy * dy))
1570 RETURN d
