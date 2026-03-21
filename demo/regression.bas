1 REM ================================================
2 REM BASIC Interpreter Silent Regression Test Suite
3 REM Only prints errors and final summary
4 REM ================================================

10 LET ERRORS = 0

15 REM Basic arithmetic and variables
20 LET A = 5 : LET B = 3

25 REM Test arithmetic operators
30 IF (A + B) <> 8 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A + B) <> 8, got "; (A + B)
40 IF (A - B) <> 2 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A - B) <> 2, got "; (A - B)
50 IF (A * B) <> 15 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A * B) <> 15, got "; (A * B)
60 IF ABS((A / B) - 1.66667) > 0.001 THEN ERRORS = ERRORS + 1 : PRINT "Error: A / B not ~1.667, got "; (A / B)
70 IF (A ^ B) <> 125 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A ^ B) <> 125, got "; (A ^ B)

75 REM Test comparison operators
80 IF (A = B) <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A = B) should be false"
90 IF (A <> B) <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A <> B) should be true"
100 IF (A > B) <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A > B) should be true"
110 IF (A < B) <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A < B) should be false"
120 IF (A >= B) <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A >= B) should be true"
130 IF (A <= B) <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: (A <= B) should be false"

135 REM Test string variables and concatenation
140 LET S$ = "Hello" : LET T$ = "World"
150 LET COMBINED$ = S$ + " " + T$
160 IF COMBINED$ <> "Hello World" THEN ERRORS = ERRORS + 1 : PRINT "Error: String concat failed, got '"; COMBINED$; "'"

165 REM Test mathematical functions
170 IF ABS(-5) <> 5 THEN ERRORS = ERRORS + 1 : PRINT "Error: ABS(-5) <> 5, got "; ABS(-5)
180 IF SQR(16) <> 4 THEN ERRORS = ERRORS + 1 : PRINT "Error: SQR(16) <> 4, got "; SQR(16)
190 IF INT(3.7) <> 3 THEN ERRORS = ERRORS + 1 : PRINT "Error: INT(3.7) <> 3, got "; INT(3.7)
200 IF SGN(-10) <> -1 THEN ERRORS = ERRORS + 1 : PRINT "Error: SGN(-10) <> -1, got "; SGN(-10)
210 IF SGN(0) <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: SGN(0) <> 0, got "; SGN(0)
220 IF SGN(10) <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: SGN(10) <> 1, got "; SGN(10)

225 REM Test trigonometric functions
230 IF ABS(SIN(0)) > 0.001 THEN ERRORS = ERRORS + 1 : PRINT "Error: SIN(0) not ~0, got "; SIN(0)
240 IF ABS(COS(0) - 1) > 0.001 THEN ERRORS = ERRORS + 1 : PRINT "Error: COS(0) not ~1, got "; COS(0)
250 IF ABS(TAN(0)) > 0.001 THEN ERRORS = ERRORS + 1 : PRINT "Error: TAN(0) not ~0, got "; TAN(0)
260 IF ABS(ATN(1) - 0.785398) > 0.001 THEN ERRORS = ERRORS + 1 : PRINT "Error: ATN(1) not ~0.785, got "; ATN(1)

265 REM Test logarithmic and exponential functions
270 IF ABS(EXP(1) - 2.71828) > 0.001 THEN ERRORS = ERRORS + 1 : PRINT "Error: EXP(1) not ~2.718, got "; EXP(1)
280 IF ABS(LOG(10) - 2.30259) > 0.001 THEN ERRORS = ERRORS + 1 : PRINT "Error: LOG(10) not ~2.303, got "; LOG(10)

285 REM Test parameterless functions
286 IF (GR_CANVAS_WIDTH + 100) <> 420 THEN ERRORS = ERRORS + 1 : PRINT "Error: GR_CANVAS_WIDTH + 100 should be 420, got "; (GR_CANVAS_WIDTH + 100)

290 REM Test FOR loops
300 LET SUM = 0
310 FOR I = 1 TO 5
320 SUM = SUM + I
330 NEXT I
340 IF SUM <> 15 THEN ERRORS = ERRORS + 1 : PRINT "Error: FOR loop sum <> 15, got "; SUM

345 REM Test FOR loop with STEP
350 LET STEPSUM = 0
360 FOR J = 2 TO 10 STEP 2
370 STEPSUM = STEPSUM + J
380 NEXT J
390 IF STEPSUM <> 30 THEN ERRORS = ERRORS + 1 : PRINT "Error: FOR STEP loop sum <> 30, got "; STEPSUM

395 REM Test nested loops
400 LET NESTED = 0
410 FOR A = 1 TO 3
420 FOR B = 1 TO 2
430 NESTED = NESTED + 1
440 NEXT B
450 NEXT A
460 IF NESTED <> 6 THEN ERRORS = ERRORS + 1 : PRINT "Error: Nested loop count <> 6, got "; NESTED

465 REM Test string functions
470 LET TESTSTR$ = "Hello World"

475 REM LEN function tests
480 IF LEN(TESTSTR$) <> 11 THEN ERRORS = ERRORS + 1 : PRINT "Error: LEN(TESTSTR$) <> 11, got "; LEN(TESTSTR$)
490 IF LEN("") <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: LEN('') <> 0, got "; LEN("")
500 IF LEN(" ") <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: LEN(' ') <> 1, got "; LEN(" ")

510 REM LEFT function tests
520 IF LEFT$(TESTSTR$, 5) <> "Hello" THEN ERRORS = ERRORS + 1 : PRINT "Error: LEFT$(TESTSTR$, 5) failed"
530 IF LEFT$(TESTSTR$, 0) <> "" THEN ERRORS = ERRORS + 1 : PRINT "Error: LEFT$(TESTSTR$, 0) not empty"

540 REM RIGHT function tests
550 IF RIGHT$(TESTSTR$, 5) <> "World" THEN ERRORS = ERRORS + 1 : PRINT "Error: RIGHT$(TESTSTR$, 5) failed"
560 IF RIGHT$(TESTSTR$, 0) <> "" THEN ERRORS = ERRORS + 1 : PRINT "Error: RIGHT$(TESTSTR$, 0) not empty"

562 REM UPPER$ and LOWER$ function tests
564 IF UPPER$(TESTSTR$) <> "HELLO WORLD" THEN ERRORS = ERRORS + 1 : PRINT "Error: UPPER$(TESTSTR$) failed, got "; UPPER$(TESTSTR$)
566 IF LOWER$(TESTSTR$) <> "hello world" THEN ERRORS = ERRORS + 1 : PRINT "Error: LOWER$(TESTSTR$) failed, got "; LOWER$(TESTSTR$)
568 IF UPPER$("abc") <> "ABC" THEN ERRORS = ERRORS + 1 : PRINT "Error: UPPER$('abc') failed"
569 IF LOWER$("XYZ") <> "xyz" THEN ERRORS = ERRORS + 1 : PRINT "Error: LOWER$('XYZ') failed"

570 REM MID function tests
580 IF MID$(TESTSTR$, 7, 5) <> "World" THEN ERRORS = ERRORS + 1 : PRINT "Error: MID$(TESTSTR$, 7, 5) failed"
590 IF MID$(TESTSTR$, 1, 5) <> "Hello" THEN ERRORS = ERRORS + 1 : PRINT "Error: MID$(TESTSTR$, 1, 5) failed"
600 IF MID$(TESTSTR$, 7) <> "World" THEN ERRORS = ERRORS + 1 : PRINT "Error: MID$(TESTSTR$, 7) failed"

610 REM ASC and CHR function tests
620 IF ASC("A") <> 65 THEN ERRORS = ERRORS + 1 : PRINT "Error: ASC('A') <> 65, got "; ASC("A")
630 IF CHR$(65) <> "A" THEN ERRORS = ERRORS + 1 : PRINT "Error: CHR$(65) failed"
640 IF ASC(TESTSTR$) <> 72 THEN ERRORS = ERRORS + 1 : PRINT "Error: ASC(TESTSTR$) <> 72, got "; ASC(TESTSTR$)

650 REM STR and VAL function tests
660 IF STR$(123) <> "123" THEN ERRORS = ERRORS + 1 : PRINT "Error: STR$(123) failed"
670 IF VAL("123") <> 123 THEN ERRORS = ERRORS + 1 : PRINT "Error: VAL('123') <> 123, got "; VAL("123")
680 IF VAL("ABC") <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: VAL('ABC') <> 0, got "; VAL("ABC")

690 REM INSTR function tests (2-parameter form)
700 IF INSTR(TESTSTR$, "World") <> 7 THEN ERRORS = ERRORS + 1 : PRINT "Error: INSTR(TESTSTR$, 'World') <> 7, got "; INSTR(TESTSTR$, "World")
710 IF INSTR(TESTSTR$, "Hello") <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: INSTR(TESTSTR$, 'Hello') <> 1, got "; INSTR(TESTSTR$, "Hello")
720 IF INSTR(TESTSTR$, "o") <> 5 THEN ERRORS = ERRORS + 1 : PRINT "Error: INSTR(TESTSTR$, 'o') <> 5, got "; INSTR(TESTSTR$, "o")
730 IF INSTR(TESTSTR$, "xyz") <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: INSTR(TESTSTR$, 'xyz') <> 0, got "; INSTR(TESTSTR$, "xyz")

740 REM INSTR function tests (3-parameter form)
750 IF INSTR(6, TESTSTR$, "o") <> 8 THEN ERRORS = ERRORS + 1 : PRINT "Error: INSTR(6, TESTSTR$, 'o') <> 8, got "; INSTR(6, TESTSTR$, "o")
760 IF INSTR(1, TESTSTR$, "H") <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: INSTR(1, TESTSTR$, 'H') <> 1, got "; INSTR(1, TESTSTR$, "H")
770 IF INSTR(10, TESTSTR$, "o") <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: INSTR(10, TESTSTR$, 'o') <> 0, got "; INSTR(10, TESTSTR$, "o")

780 REM Test conversions
790 LET NUM = 42
800 LET NUMSTR$ = STR$(NUM)
810 IF VAL(NUMSTR$) <> NUM THEN ERRORS = ERRORS + 1 : PRINT "Error: VAL(STR$(NUM)) conversion failed"

820 REM Test IF-THEN statements
830 LET X = 10
840 LET TESTED = 0
850 IF X > 5 THEN TESTED = 1
860 IF TESTED <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: IF-THEN failed for X > 5"
870 IF X < 5 THEN TESTED = 2
880 IF TESTED <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: IF-THEN incorrectly executed for X < 5"

885 REM ================================================
886 REM Test compound IF-THEN statements (the bug case)
887 REM ================================================

888 REM Test AND and OR Logical Operators
889 LET TESTED = 0 : IF 1 = 1 AND 2 = 2 THEN TESTED = 1
890 IF TESTED <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: 1=1 AND 2=2 failed"
891 LET TESTED = 0 : IF 1 = 2 AND 1 = 1 THEN TESTED = 1
892 IF TESTED <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: 1=2 AND 1=1 executed"
893 LET TESTED = 0 : IF 1 = 2 OR 2 = 2 THEN TESTED = 1
894 IF TESTED <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: 1=2 OR 2=2 failed"
895 LET TESTED = 0 : IF 1 = 2 OR 2 = 3 THEN TESTED = 1
896 IF TESTED <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: 1=2 OR 2=3 executed"

890 REM Test 1: False condition should skip all statements on line
895 LET COMPOUND1 = 0 : LET COMPOUND2 = 0 : LET COMPOUND3 = 0
900 IF 1 = 2 THEN COMPOUND1 = 1 : COMPOUND2 = 1 : COMPOUND3 = 1
905 IF COMPOUND1 <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Compound IF false case - COMPOUND1 should be 0, got "; COMPOUND1
910 IF COMPOUND2 <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Compound IF false case - COMPOUND2 should be 0, got "; COMPOUND2
915 IF COMPOUND3 <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Compound IF false case - COMPOUND3 should be 0, got "; COMPOUND3

920 REM Test 2: True condition should execute all statements on line
925 LET COMPOUND4 = 0 : LET COMPOUND5 = 0 : LET COMPOUND6 = 0
930 IF 1 = 1 THEN COMPOUND4 = 1 : COMPOUND5 = 2 : COMPOUND6 = 3
935 IF COMPOUND4 <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: Compound IF true case - COMPOUND4 should be 1, got "; COMPOUND4
940 IF COMPOUND5 <> 2 THEN ERRORS = ERRORS + 1 : PRINT "Error: Compound IF true case - COMPOUND5 should be 2, got "; COMPOUND5
945 IF COMPOUND6 <> 3 THEN ERRORS = ERRORS + 1 : PRINT "Error: Compound IF true case - COMPOUND6 should be 3, got "; COMPOUND6

946 REM Test Nested DICT arrays
947 DICT D1("foo", 1, "bar", 2)
948 DICT D2("nested", D1, "val", 3)
949 IF D2("val") <> 3 THEN ERRORS = ERRORS + 1 : PRINT "Error: DICT nested val failed"
950 LET SUB = D2("nested")
951 IF SUB("foo") <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: DICT nested extraction failed"
952 LET FMT$ = STR$(D1)
953 IF FMT$ <> "DICT(" + CHR$(34) + "foo" + CHR$(34) + ", 1, " + CHR$(34) + "bar" + CHR$(34) + ", 2)" THEN ERRORS = ERRORS + 1 : PRINT "Error: DICT to string formatting failed, got "; FMT$
954 DIM ARR_FMT(2) : LET ARR_FMT(0) = 4 : LET ARR_FMT(1) = 5 : LET ARR_FMT(2) = 6
955 IF STR$(ARR_FMT) <> "ARRAY(4, 5, 6)" THEN ERRORS = ERRORS + 1 : PRINT "Error: 1D DIM format failed, got "; STR$(ARR_FMT)
956 ARRAY INLINE(9, 8, 7)
957 IF STR$(INLINE) <> "ARRAY(9, 8, 7)" THEN ERRORS = ERRORS + 1 : PRINT "Error: ARRAY inline format failed, got "; STR$(INLINE)

950 REM Test 3: False condition with mixed statement types
955 LET COMPOUND7 = 0 : LET COMPOUND8$ = "unchanged"
960 IF 5 > 10 THEN COMPOUND7 = 99 : COMPOUND8$ = "changed" : PRINT "This should not print"
965 IF COMPOUND7 <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Mixed compound IF - COMPOUND7 should be 0, got "; COMPOUND7
970 IF COMPOUND8$ <> "unchanged" THEN ERRORS = ERRORS + 1 : PRINT "Error: Mixed compound IF - COMPOUND8$ should be 'unchanged', got '"; COMPOUND8$; "'"

975 REM Test 4: True condition with mixed statement types
980 LET COMPOUND9 = 0 : LET COMPOUND10$ = "before"
985 IF 5 < 10 THEN COMPOUND9 = 42 : COMPOUND10$ = "after" : REM this comment should not cause issues
990 IF COMPOUND9 <> 42 THEN ERRORS = ERRORS + 1 : PRINT "Error: Mixed compound IF true - COMPOUND9 should be 42, got "; COMPOUND9
995 IF COMPOUND10$ <> "after" THEN ERRORS = ERRORS + 1 : PRINT "Error: Mixed compound IF true - COMPOUND10$ should be 'after', got '"; COMPOUND10$; "'"

1000 REM Test 5: Nested compound statements with false condition
1005 LET NESTED1 = 0 : LET NESTED2 = 0
1010 IF 2 = 3 THEN NESTED1 = 1 : IF NESTED1 = 1 THEN NESTED2 = 1
1015 IF NESTED1 <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Nested compound false - NESTED1 should be 0, got "; NESTED1
1020 IF NESTED2 <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Nested compound false - NESTED2 should be 0, got "; NESTED2

1025 REM Test 6: Multiple false conditions on same line
1030 LET MULTI1 = 0 : LET MULTI2 = 0 : LET MULTI3 = 0
1035 IF 1 = 0 THEN MULTI1 = 1 : IF 2 = 0 THEN MULTI2 = 1 : IF 3 = 0 THEN MULTI3 = 1
1040 IF MULTI1 <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Multiple false conditions - MULTI1 should be 0, got "; MULTI1
1045 IF MULTI2 <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Multiple false conditions - MULTI2 should be 0, got "; MULTI2
1050 IF MULTI3 <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Multiple false conditions - MULTI3 should be 0, got "; MULTI3

1055 REM Test 7: Function calls in false compound statements (should not execute)
1060 LET FUNC_TEST = 0
1065 IF 10 < 5 THEN FUNC_TEST = ABS(-5) : FUNC_TEST = FUNC_TEST + SQR(16) : FUNC_TEST = FUNC_TEST * 2
1070 IF FUNC_TEST <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: Function calls in false compound - FUNC_TEST should be 0, got "; FUNC_TEST

1075 REM Test 8: String operations in false compound statements
1080 LET STR_TEST$ = "original"
1085 IF "hello" = "world" THEN STR_TEST$ = "modified" : STR_TEST$ = STR_TEST$ + "more" : STR_TEST$ = LEFT$(STR_TEST$, 3)
1090 IF STR_TEST$ <> "original" THEN ERRORS = ERRORS + 1 : PRINT "Error: String ops in false compound - STR_TEST$ should be 'original', got '"; STR_TEST$; "'"

1095 REM ================================================
1096 REM GOTO and GOSUB testing section - SIMPLIFIED
1097 REM Each test is self-contained and easy to follow
1098 REM ================================================

1100 REM --- Test 1: Basic static GOTO ---
1105 LET TEST1 = 0
1110 GOTO 1120
1115 LET TEST1 = 99 : REM Should be skipped
1120 LET TEST1 = 1
1125 IF TEST1 <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: Static GOTO failed, TEST1 = "; TEST1

1130 REM --- Test 2: Dynamic GOTO with variable ---
1135 LET TEST2 = 0
1140 LET TARGET = 1155
1145 GOTO TARGET
1150 LET TEST2 = 99 : REM Should be skipped
1155 LET TEST2 = 2
1160 IF TEST2 <> 2 THEN ERRORS = ERRORS + 1 : PRINT "Error: Dynamic GOTO failed, TEST2 = "; TEST2

1165 REM --- Test 3: GOTO with expression ---
1170 LET TEST3 = 0
1175 GOTO (1180 + 10)
1180 LET TEST3 = 99 : REM Should be skipped
1185 GOTO 1195
1190 LET TEST3 = 3
1195 IF TEST3 <> 3 THEN ERRORS = ERRORS + 1 : PRINT "Error: GOTO with expression failed, TEST3 = "; TEST3

1200 REM --- Test 4: Basic static GOSUB ---
1205 LET TEST4 = 0
1210 GOSUB 1500
1215 IF TEST4 <> 10 THEN ERRORS = ERRORS + 1 : PRINT "Error: Static GOSUB failed, TEST4 = "; TEST4

1220 REM --- Test 5: Dynamic GOSUB with variable ---
1225 LET TEST5 = 0
1230 LET SUBLINE = 1510
1235 GOSUB SUBLINE
1240 IF TEST5 <> 20 THEN ERRORS = ERRORS + 1 : PRINT "Error: Dynamic GOSUB failed, TEST5 = "; TEST5

1245 REM --- Test 6: GOSUB with expression ---
1250 LET TEST6 = 0
1255 GOSUB (1500 + 20)
1260 IF TEST6 <> 30 THEN ERRORS = ERRORS + 1 : PRINT "Error: GOSUB with expression failed, TEST6 = "; TEST6

1265 REM --- Test 7: Multiple GOSUBs (test return stack) ---
1270 LET TEST7 = 0
1275 GOSUB 1530
1280 GOSUB 1540
1285 GOSUB 1550
1290 IF TEST7 <> 111 THEN ERRORS = ERRORS + 1 : PRINT "Error: Multiple GOSUBs failed, TEST7 = "; TEST7

1295 REM --- Test 8: Nested GOSUB (subroutine calls another) ---
1300 LET TEST8 = 0
1305 GOSUB 1560
1310 IF TEST8 <> 15 THEN ERRORS = ERRORS + 1 : PRINT "Error: Nested GOSUB failed, TEST8 = "; TEST8

1315 REM --- Test 9: Conditional GOTO ---
1320 LET TEST9 = 0
1325 IF 1 = 1 THEN GOTO 1335
1330 LET TEST9 = 99 : REM Should be skipped
1335 LET TEST9 = 9
1340 IF TEST9 <> 9 THEN ERRORS = ERRORS + 1 : PRINT "Error: Conditional GOTO (true) failed, TEST9 = "; TEST9

1345 REM --- Test 10: Conditional GOTO that should not execute ---
1350 LET TEST10 = 10
1355 IF 1 = 2 THEN GOTO 1365
1360 GOTO 1370
1365 LET TEST10 = 99 : REM Should be skipped
1370 IF TEST10 <> 10 THEN ERRORS = ERRORS + 1 : PRINT "Error: Conditional GOTO (false) failed, TEST10 = "; TEST10

1375 REM --- Test 11: FOR loop with GOTO (exit early) ---
1380 LET TEST11 = 0
1385 FOR I = 1 TO 10
1390   LET TEST11 = TEST11 + 1
1395   IF I = 3 THEN GOTO 1405
1400 NEXT I
1405 IF TEST11 <> 3 THEN ERRORS = ERRORS + 1 : PRINT "Error: FOR loop with GOTO exit failed, TEST11 = "; TEST11

1410 REM --- Test 12: GOSUB inside a loop ---
1415 LET TEST12 = 0
1420 FOR J = 1 TO 3
1425   GOSUB 1570
1430 NEXT J
1435 IF TEST12 <> 30 THEN ERRORS = ERRORS + 1 : PRINT "Error: GOSUB in loop failed, TEST12 = "; TEST12

1440 REM --- Test 13: IF THEN RETURN ---
1441 LET TEST13 = 0
1442 GOSUB 1588
1443 IF TEST13 <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: IF THEN RETURN failed, TEST13 = "; TEST13
1444 REM --- Test 14: IF THEN ELSE RETURN ---
1445 LET TEST14 = 0
1446 GOSUB 1593
1447 IF TEST14 <> 2 THEN ERRORS = ERRORS + 1 : PRINT "Error: IF THEN ELSE RETURN failed, TEST14 = "; TEST14
1448 REM Done with GOTO/GOSUB tests, skip to next section
1449 GOTO 1605

1450 REM ================================================
1451 REM Subroutines section - keep them together
1452 REM All subroutines between 1500-1599
1453 REM ================================================

1500 REM Subroutine for Test 4
1505 LET TEST4 = 10
1506 RETURN

1510 REM Subroutine for Test 5
1515 LET TEST5 = 20
1516 RETURN

1520 REM Subroutine for Test 6
1525 LET TEST6 = 30
1526 RETURN

1530 REM Subroutine for Test 7 (first call)
1535 LET TEST7 = TEST7 + 1
1536 RETURN

1540 REM Subroutine for Test 7 (second call)
1545 LET TEST7 = TEST7 + 10
1546 RETURN

1550 REM Subroutine for Test 7 (third call)
1555 LET TEST7 = TEST7 + 100
1556 RETURN

1560 REM Subroutine for Test 8 (calls another subroutine)
1565 LET TEST8 = 5
1566 GOSUB 1580
1567 RETURN

1570 REM Subroutine for Test 12 (called from loop)
1575 LET TEST12 = TEST12 + 10
1576 RETURN

1580 REM Subroutine for Test 8 (nested call)
1585 LET TEST8 = TEST8 + 10
1586 RETURN
1587 REM Subroutine for Test 13 (IF THEN RETURN)
1588 LET TEST13 = 1
1589 IF 1 = 1 THEN RETURN
1590 LET TEST13 = 99
1591 RETURN
1592 REM Subroutine for Test 14 (IF THEN ELSE RETURN)
1593 LET TEST14 = 2
1594 IF 1 = 0 THEN PRINT "SKIP" ELSE RETURN
1595 LET TEST14 = 99
1596 RETURN
1597 REM End of subroutines section

1598 REM ================================================
1599 REM Array Testing Section
1600 REM ================================================

1605 REM Test 1: Basic 1D array declaration and access
1610 DIM ARR1(5)
1615 LET ARR1(0) = 10 : LET ARR1(1) = 20 : LET ARR1(5) = 50
1620 IF ARR1(0) <> 10 THEN ERRORS = ERRORS + 1 : PRINT "Error: ARR1(0) should be 10, got "; ARR1(0)
1625 IF ARR1(1) <> 20 THEN ERRORS = ERRORS + 1 : PRINT "Error: ARR1(1) should be 20, got "; ARR1(1)
1630 IF ARR1(5) <> 50 THEN ERRORS = ERRORS + 1 : PRINT "Error: ARR1(5) should be 50, got "; ARR1(5)
1635 IF ARR1(2) <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: ARR1(2) should be 0 (default), got "; ARR1(2)

1640 REM Test 2: Basic 2D array declaration and access
1645 DIM MAT(3, 2)
1650 LET MAT(0, 0) = 11 : LET MAT(1, 1) = 22 : LET MAT(3, 2) = 99
1655 IF MAT(0, 0) <> 11 THEN ERRORS = ERRORS + 1 : PRINT "Error: MAT(0,0) should be 11, got "; MAT(0, 0)
1660 IF MAT(1, 1) <> 22 THEN ERRORS = ERRORS + 1 : PRINT "Error: MAT(1,1) should be 22, got "; MAT(1, 1)
1665 IF MAT(3, 2) <> 99 THEN ERRORS = ERRORS + 1 : PRINT "Error: MAT(3,2) should be 99, got "; MAT(3, 2)
1670 IF MAT(2, 1) <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: MAT(2,1) should be 0 (default), got "; MAT(2, 1)

1675 REM Test 3: Array assignment with expressions
1680 DIM EXPR_ARR(3)
1685 FOR K = 0 TO 3
1690   LET EXPR_ARR(K) = (K + 1) * 10
1695 NEXT K
1700 IF EXPR_ARR(0) <> 10 THEN ERRORS = ERRORS + 1 : PRINT "Error: EXPR_ARR(0) should be 10, got "; EXPR_ARR(0)
1705 IF EXPR_ARR(1) <> 20 THEN ERRORS = ERRORS + 1 : PRINT "Error: EXPR_ARR(1) should be 20, got "; EXPR_ARR(1)
1710 IF EXPR_ARR(2) <> 30 THEN ERRORS = ERRORS + 1 : PRINT "Error: EXPR_ARR(2) should be 30, got "; EXPR_ARR(2)
1715 IF EXPR_ARR(3) <> 40 THEN ERRORS = ERRORS + 1 : PRINT "Error: EXPR_ARR(3) should be 40, got "; EXPR_ARR(3)

1720 REM Test 4: 2D array with nested loops
1725 DIM GRID(2, 2)
1730 FOR ROW = 0 TO 2
1735   FOR COL = 0 TO 2
1740     LET GRID(ROW, COL) = ROW * 10 + COL
1745   NEXT COL
1750 NEXT ROW
1755 IF GRID(0, 0) <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: GRID(0,0) should be 0, got "; GRID(0, 0)
1760 IF GRID(1, 2) <> 12 THEN ERRORS = ERRORS + 1 : PRINT "Error: GRID(1,2) should be 12, got "; GRID(1, 2)
1765 IF GRID(2, 1) <> 21 THEN ERRORS = ERRORS + 1 : PRINT "Error: GRID(2,1) should be 21, got "; GRID(2, 1)

1770 REM Test 5: Array indices with variables
1775 DIM VAR_IDX(4)
1780 LET IDX1 = 1 : LET IDX2 = 3
1785 LET VAR_IDX(IDX1) = 100 : LET VAR_IDX(IDX2) = 300
1790 IF VAR_IDX(1) <> 100 THEN ERRORS = ERRORS + 1 : PRINT "Error: VAR_IDX(1) should be 100, got "; VAR_IDX(1)
1795 IF VAR_IDX(3) <> 300 THEN ERRORS = ERRORS + 1 : PRINT "Error: VAR_IDX(3) should be 300, got "; VAR_IDX(3)

1800 REM Test 6: Array indices with expressions
1805 DIM EXPR_IDX(5)
1810 LET BASE = 2
1815 LET EXPR_IDX(BASE + 1) = 77 : LET EXPR_IDX(BASE * 2) = 88
1820 IF EXPR_IDX(3) <> 77 THEN ERRORS = ERRORS + 1 : PRINT "Error: EXPR_IDX(3) should be 77, got "; EXPR_IDX(3)
1825 IF EXPR_IDX(4) <> 88 THEN ERRORS = ERRORS + 1 : PRINT "Error: EXPR_IDX(4) should be 88, got "; EXPR_IDX(4)

1830 REM Test 7: 3D array
1835 DIM CUBE(2, 2, 2)
1840 LET CUBE(1, 1, 1) = 111 : LET CUBE(0, 2, 1) = 021 : LET CUBE(2, 0, 2) = 202
1845 IF CUBE(1, 1, 1) <> 111 THEN ERRORS = ERRORS + 1 : PRINT "Error: CUBE(1,1,1) should be 111, got "; CUBE(1, 1, 1)
1850 IF CUBE(0, 2, 1) <> 21 THEN ERRORS = ERRORS + 1 : PRINT "Error: CUBE(0,2,1) should be 21, got "; CUBE(0, 2, 1)
1855 IF CUBE(2, 0, 2) <> 202 THEN ERRORS = ERRORS + 1 : PRINT "Error: CUBE(2,0,2) should be 202, got "; CUBE(2, 0, 2)

1860 REM Test 8: Array sum calculation
1865 DIM SUM_ARR(4)
1870 FOR N = 0 TO 4
1875   LET SUM_ARR(N) = N * N
1880 NEXT N
1885 LET TOTAL = 0
1890 FOR N = 0 TO 4
1895   LET TOTAL = TOTAL + SUM_ARR(N)
1900 NEXT N
1905 REM Sum should be 0 + 1 + 4 + 9 + 16 = 30
1910 IF TOTAL <> 30 THEN ERRORS = ERRORS + 1 : PRINT "Error: Array sum should be 30, got "; TOTAL

1915 REM Test 9: Matrix multiplication (2x2)
1920 DIM A_MAT(1, 1) : DIM B_MAT(1, 1) : DIM C_MAT(1, 1)
1925 REM Initialize A = [[1,2], [3,4]]
1930 LET A_MAT(0, 0) = 1 : LET A_MAT(0, 1) = 2
1935 LET A_MAT(1, 0) = 3 : LET A_MAT(1, 1) = 4
1940 REM Initialize B = [[5,6], [7,8]]
1945 LET B_MAT(0, 0) = 5 : LET B_MAT(0, 1) = 6
1950 LET B_MAT(1, 0) = 7 : LET B_MAT(1, 1) = 8
1955 REM Calculate C = A * B
1960 FOR ROW = 0 TO 1
1965   FOR COL = 0 TO 1
1970     LET C_MAT(ROW, COL) = 0
1975     FOR K = 0 TO 1
1980       LET C_MAT(ROW, COL) = C_MAT(ROW, COL) + A_MAT(ROW, K) * B_MAT(K, COL)
1985     NEXT K
1990   NEXT COL
1995 NEXT ROW
2000 REM Check results: C should be [[19,22], [43,50]]
2005 IF C_MAT(0, 0) <> 19 THEN ERRORS = ERRORS + 1 : PRINT "Error: C_MAT(0,0) should be 19, got "; C_MAT(0, 0)
2010 IF C_MAT(0, 1) <> 22 THEN ERRORS = ERRORS + 1 : PRINT "Error: C_MAT(0,1) should be 22, got "; C_MAT(0, 1)
2015 IF C_MAT(1, 0) <> 43 THEN ERRORS = ERRORS + 1 : PRINT "Error: C_MAT(1,0) should be 43, got "; C_MAT(1, 0)
2020 IF C_MAT(1, 1) <> 50 THEN ERRORS = ERRORS + 1 : PRINT "Error: C_MAT(1,1) should be 50, got "; C_MAT(1, 1)

2025 REM Test 10: String arrays (if supported)
2030 DIM STR_ARR$(3)
2035 LET STR_ARR$(0) = "First" : LET STR_ARR$(1) = "Second" : LET STR_ARR$(3) = "Last"
2040 IF STR_ARR$(0) <> "First" THEN ERRORS = ERRORS + 1 : PRINT "Error: STR_ARR$(0) should be 'First', got '"; STR_ARR$(0); "'"
2045 IF STR_ARR$(1) <> "Second" THEN ERRORS = ERRORS + 1 : PRINT "Error: STR_ARR$(1) should be 'Second', got '"; STR_ARR$(1); "'"
2050 IF STR_ARR$(3) <> "Last" THEN ERRORS = ERRORS + 1 : PRINT "Error: STR_ARR$(3) should be 'Last', got '"; STR_ARR$(3); "'"
2055 IF LEN(STR_ARR$(2)) <> 0 THEN ERRORS = ERRORS + 1 : PRINT "Error: STR_ARR$(2) should be empty, got '"; STR_ARR$(2); "'"

2060 REM Test 11: Array bounds (edge cases)
2065 DIM EDGE(1)
2070 LET EDGE(0) = 999 : LET EDGE(1) = 1000
2075 IF EDGE(0) <> 999 THEN ERRORS = ERRORS + 1 : PRINT "Error: EDGE(0) should be 999, got "; EDGE(0)
2080 IF EDGE(1) <> 1000 THEN ERRORS = ERRORS + 1 : PRINT "Error: EDGE(1) should be 1000, got "; EDGE(1)

2085 REM Test 12: Large index values
2090 DIM LARGE(100)
2095 LET LARGE(0) = 1 : LET LARGE(50) = 51 : LET LARGE(100) = 101
2100 IF LARGE(0) <> 1 THEN ERRORS = ERRORS + 1 : PRINT "Error: LARGE(0) should be 1, got "; LARGE(0)
2105 IF LARGE(50) <> 51 THEN ERRORS = ERRORS + 1 : PRINT "Error: LARGE(50) should be 51, got "; LARGE(50)
2110 IF LARGE(100) <> 101 THEN ERRORS = ERRORS + 1 : PRINT "Error: LARGE(100) should be 101, got "; LARGE(100)

2115 REM Test 13: ARRAY A(1, 2, 3) statement
2120 ARRAY PREARR(10, 20, 30,
2125 40, 50, 60)
2130 IF PREARR(0) <> 10 THEN ERRORS = ERRORS + 1 : PRINT "Error: PREARR(0) should be 10, got "; PREARR(0)
2135 IF PREARR(2) <> 30 THEN ERRORS = ERRORS + 1 : PRINT "Error: PREARR(2) should be 30, got "; PREARR(2)
2140 IF PREARR(5) <> 60 THEN ERRORS = ERRORS + 1 : PRINT "Error: PREARR(5) should be 60, got "; PREARR(5)
2142 REM Test 13b: Multiple DIM statements on one line
2143 DIM M1(2), M2(3), M3
2144 LET M1(1) = 11: LET M2(2) = 22: LET M3(0) = 33
2146 IF M1(1) <> 11 THEN ERRORS = ERRORS + 1 : PRINT "Error: M1(1) should be 11, got "; M1(1)
2147 IF M2(2) <> 22 THEN ERRORS = ERRORS + 1 : PRINT "Error: M2(2) should be 22, got "; M2(2)
2148 IF M3(0) <> 33 THEN ERRORS = ERRORS + 1 : PRINT "Error: M3(0) should be 33, got "; M3(0)

2145 REM Test 14: Hash Tables
2150 DICT TBL(
2151   "foo", 10,
2152   "bar", 20,
2155   "baz", 30)
2160 IF TBL("foo") <> 10 THEN ERRORS = ERRORS + 1 : PRINT "Error: TBL('foo') should be 10, got "; TBL("foo")
2165 LET TBL("foo") = NIL
2170 IF TBL("foo") <> NIL THEN ERRORS = ERRORS + 1 : PRINT "Error: TBL('foo') should be deleted and return NIL."
2175 LET COUNT = 0
2180 FORKEYS K, TBL
2185   IF TBL(K) <> NIL THEN LET COUNT = COUNT + 1
2190 NEXT K
2195 IF COUNT <> 2 THEN ERRORS = ERRORS + 1 : PRINT "Error: TBL should have 2 keys remaining, counted: "; COUNT
2200 LET TBL = NIL
2205 IF TBL("bar") <> NIL THEN ERRORS = ERRORS + 1 : PRINT "Error: TBL('bar') should be NIL after whole table clear."

2206 REM padding
2210 REM Test 15: RESTORE, READ and DATA
2212 DIM R_ARR(5), R_MAT(2, 2)
2214 DICT R_DICT
2215 RESTORE 2220
2216 READ R_ARR, 5
2218 READ R_MAT, 4, 1, 0
2219 READ R_DICT, 2
2220 DATA 100, 200, 300, 400, 500
2222 DATA 11, 12, 20, 21
2224 DATA "key1", 99, "key2", 100
2226 IF R_ARR(0) <> 100 THEN ERRORS = ERRORS + 1 : PRINT "Error: RESTORE/READ failed for R_ARR(0) = "; R_ARR(0)
2228 IF R_ARR(4) <> 500 THEN ERRORS = ERRORS + 1 : PRINT "Error: RESTORE/READ failed for R_ARR(4) = "; R_ARR(4)
2230 IF R_MAT(1, 0) <> 11 THEN ERRORS = ERRORS + 1 : PRINT "Error: READ multi-dim start failed for R_MAT(1, 0) = "; R_MAT(1, 0)
2232 IF R_MAT(2, 0) <> 21 THEN ERRORS = ERRORS + 1 : PRINT "Error: READ multi-dim wrap failed for R_MAT(2, 0) = "; R_MAT(2, 0)
2234 IF R_DICT("key1") <> 99 THEN ERRORS = ERRORS + 1 : PRINT "Error: READ dict failed for R_DICT('key1') = "; R_DICT("key1")
2236 IF R_DICT("key2") <> 100 THEN ERRORS = ERRORS + 1 : PRINT "Error: READ dict failed for R_DICT('key2') = "; R_DICT("key2")
2238 RESTORE
2239 LET R_DYN = DIM(2)
2241 READ R_DYN, 3
2243 IF R_DYN(0) <> 100 THEN ERRORS = ERRORS + 1 : PRINT "Error: READ LET failed for R_DYN(0) = "; R_DYN(0)
2244 RESTORE
2246 READ R_ARR, 1
2248 IF R_ARR(0) <> 100 THEN ERRORS = ERRORS + 1 : PRINT "Error: Default RESTORE failed for R_ARR(0) = "; R_ARR(0)

2245 REM Test 16: Internal Order Indexing
2250 LET X = 0
2252 LoopBlock: LET X = X + 1
2254 IF X < 3 THEN LoopBlock
2256 GOTO 2270
2260 GOTO 2245
2270 IF X <> 3 THEN ERRORS = ERRORS + 1 : PRINT "Error: Un-numbered interleaving failed."

2400 REM Test 16: User Functions and Scoping
2410 LET X = 100
2420 LET Y = 500
2430 LET FUNC_RES = CALL DO_MATH(10, 20)
IF FUNC_RES <> 30 THEN ERRORS = ERRORS + 1 : PRINT "Error: CALL DO_MATH(10, 20) returned "; FUNC_RES; " instead of 30"
IF X <> 100 THEN ERRORS = ERRORS + 1 : PRINT "Error: Outer X was mutated! Got "; X
IF Y <> 500 THEN ERRORS = ERRORS + 1 : PRINT "Error: Outer Y was mutated! Got "; Y
CALL MUTATE_GLOBAL()
IF Z <> 999 THEN ERRORS = ERRORS + 1 : PRINT "Error: Function failed to mutate true global variable Z."

2480 REM Test 17: Shorthand syntax (? and !)
2485 LET SHTH_TEST = 0
2490 ! MUTATE_SHORTHAND()
2495 IF SHTH_TEST <> 777 THEN ERRORS = ERRORS + 1 : ? "Error: ! shorthand failed to CALL MUTATE_SHORTHAND"

2500 REM Test 18.5: String Escapes
2502 LET ESC_TEST$ = "A\"B\n"
2504 IF LEN(ESC_TEST$) <> 4 THEN ERRORS = ERRORS + 1 : ? "Error: Escape length failed!"
2506 IF MID$(ESC_TEST$, 2, 1) <> CHR$(34) THEN ERRORS = ERRORS + 1 : ? "Error: Escape quote failed!"

2510 REM Test 18: Editor Line Sorting
2515 LET SORT_TEST = 0
2540 IF SORT_TEST <> 1 THEN ERRORS = ERRORS + 1 : ? "Error: Line numbers executed out of order!"
2520 GOTO 2550
2530 LET SORT_TEST = 1
2550 REM Skip to final summary section
2560 GOTO 3000

REM Test definition of user functions
FUN DO_MATH(X, Y)
  LET TOTAL = X + Y
RETURN TOTAL

FUN MUTATE_GLOBAL()
  LET Z = 999
RETURN

FUN MUTATE_SHORTHAND()
  LET SHTH_TEST = 777
RETURN

3000 REM Final summary
3010 PRINT
3020 IF ERRORS = 0 THEN PRINT "SUCCESS: All tests passed!"
3030 IF ERRORS > 0 THEN PRINT "FAILED: "; ERRORS; " error(s) found"
3040 PRINT

3100 END

REM End-of-file