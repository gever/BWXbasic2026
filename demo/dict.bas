10 REM ==========================================
20 REM bwxBASIC Nested DICT Demo
30 REM This example demonstrates associative arrays 
40 REM inside associative arrays!
50 REM ==========================================
60 PRINT "==== DICTIONARY DEMO ===="
70 PRINT

90 REM 1. Define three people as dictionaries
100 DICT P1("name", "Alice", "job", "Engineer", "age", 28)
110 DICT P2("name", "Bob", "job", "Designer", "age", 34)
120 DICT P3("name", "Charlie", "job", "Manager", "age", 42)

130 REM 2. Add them to a master 'directory' dictionary
140 PRINT "Building Employee Directory..." : DELAY 500
150 DICT DIRECTORY("emp01", P1, "emp02", P2, "emp03", P3)

160 REM 3. Print the raw underlying structure using the new formatter!
170 PRINT 
180 PRINT "Raw stringified DIRECTORY:"
190 PRINT DIRECTORY : PRINT
200 DELAY 500

210 REM 4. Extract data cleanly
220 PRINT "Iterating over employees..." : PRINT
230 FORKEYS ID, DIRECTORY
240   REM Extract the sub-dictionary
250   LET PERSON = DIRECTORY(ID)
260   REM Read fields from the sub-dictionary
270   PRINT ID; " -> "; PERSON("name"); " ("; PERSON("job"); ", Age: "; PERSON("age"); ")"
280 NEXT ID

290 PRINT : PRINT "Done!"
