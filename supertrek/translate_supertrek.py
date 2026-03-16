import re

def translate_line(line):
    # Split by strings to avoid messing up things inside quotes
    parts = []
    
    # We will build the new line piece by piece
    result = ""
    
    quote_split = re.split(r'(".*?")', line)
    
    for segment in quote_split:
        if not segment:
            continue
        if segment.startswith('"') and segment.endswith('"'):
            result += segment
        else:
            # Code segment - apply transformations.
            # If a REM keyword appears in this segment, everything from REM
            # onward is a comment and must be left completely untouched.
            rem_match = re.search(r'(?<![A-Za-z_])REM(?![A-Za-z_])', segment)
            if rem_match:
                code_part = segment[:rem_match.start()]
                rem_part  = segment[rem_match.start():]
            else:
                code_part = segment
                rem_part  = ''

            s = code_part

            # Print TAB -> HTAB + PRINT
            s = re.sub(r'PRINTTAB\((.*?)\);?', r'HTAB \1 : PRINT ', s)
            
            # Sub ON x GOTO
            s = re.sub(r'\bON([A-Z0-9_]+)GOTO', r'ON \1 GOTO', s)
            s = re.sub(r'\bON([A-Z0-9_]+)GOSUB', r'ON \1 GOSUB', s)
            
            keywords = [
                'IF', 'THEN', 'GOTO', 'GOSUB', 'AND', 'LET', 'PRINT', 'INPUT', 
                'DEF', 'RETURN', 'DIM', 'STEP', 'END', 'STOP', 'NEXT', 'FOR', 'ON'
            ]
            
            # 1. Add Space AFTER the keyword
            for kw in keywords:
                # Negative lookbehind: not preceded by a letter or underscore
                pattern = r'(?<![A-Za-z_])' + kw + r'(?=[A-Za-z0-9_\.])'
                s = re.sub(pattern, kw + ' ', s)

            # 2. Add Space BEFORE the keyword
            for kw in keywords:
                # Negative lookahead: not followed by letter or underscore
                pattern = r'(?<=[A-Za-z0-9_\.])' + kw + r'(?![A-Za-z_])'
                s = re.sub(pattern, ' ' + kw, s)

            # 3. Handle TO separately: exclude the TO inside GOTO
            s = re.sub(r'(?<![A-Za-z_])TO(?=[A-Za-z0-9_\.])', 'TO ', s)
            s = re.sub(r'(?<=[A-Za-z0-9_\.])(?<!GO)TO(?![A-Za-z_])', ' TO', s)

            # 4. Handle OR separately: exclude the OR inside FOR
            s = re.sub(r'(?<![A-Za-z_])OR(?=[A-Za-z0-9_\.])', 'OR ', s)
            s = re.sub(r'(?<=[A-Za-z0-9_\.])(?<!F)OR(?![A-Za-z_])', ' OR', s)
                
            # Clean up double spaces if any
            s = re.sub(r'  +', ' ', s)

            result += s + rem_part
            
    return result

with open('../demo/supertrek.bas', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(translate_line(line))

with open('../demo/supertrek_bwx.bas', 'w') as f:
    f.writelines(new_lines)

print("Translation complete! Written to supertrek_bwx.bas.")
