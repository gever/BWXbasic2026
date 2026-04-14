Put data files such as JSON, CSV, etc. in this directory.

Load them from bwxBASIC using LOAD_JSON or LOAD_CSV.

Example:
10 D = LOAD_JSON("data/shapes.json")
20 PRINT D.shapes[0].name
30 PRINT D.shapes[0].x