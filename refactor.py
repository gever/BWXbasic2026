import re
import sys

def main():
    with open("demo/arrow_n.bas", "r") as f:
        lines = f.readlines()
        
    out_lines = []
    
    # 1. First pass: Assign line numbers (by 10s) and record labels
    labels = {}
    current_line_num = 10
    
    # regex for getting standard labels "Label:"
    label_re = re.compile(r'^\s*([A-Za-z_]+):\s*(.*)')
    
    line_assigned = []
    
    for line in lines:
        s_line = line.strip('\n')
        
        # skip completely blank lines, but we can keep them without numbers
        # actually for standard basic, usually all lines have numbers. Let's just number non-blanks
        if not s_line.strip():
            line_assigned.append((None, s_line))
            continue
            
        m = label_re.match(s_line)
        if m:
            label_name = m.group(1)
            rest_of_line = m.group(2)
            labels[label_name.upper()] = current_line_num
            
            if rest_of_line.strip():
                line_assigned.append((current_line_num, rest_of_line))
                current_line_num += 10
            else:
                # The label was on its own line. We assign the next line number to it implicitly, 
                # but let's just emit a REM for it to hold the line number, or just skip it
                line_assigned.append((current_line_num, f"REM {label_name}"))
                current_line_num += 10
        else:
            line_assigned.append((current_line_num, s_line))
            current_line_num += 10

    # 2. Second pass: Replace GOTO / GOSUB label with GOTO / GOSUB line_num
    goto_re = re.compile(r'(GOTO|GOSUB)\s+([A-Za-z_]+)', re.IGNORECASE)
    
    def replacer(match):
        cmd = match.group(1)
        target = match.group(2).upper()
        if target in labels:
            return f"{cmd} {labels[target]}"
        return match.group(0)

    with open("demo/arrow_n.bas", "w") as f:
        for num, text in line_assigned:
            if num is None:
                f.write(text + "\n")
            else:
                # replace labels
                new_text = goto_re.sub(replacer, text)
                f.write(f"{num} {new_text.lstrip()}\n")

if __name__ == "__main__":
    main()
