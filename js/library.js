export const LIB = {
    'SIN': 'Math.sin', 'COS': 'Math.cos', 'TAN': 'Math.tan', 'ATN': 'Math.atan', 'EXP': 'Math.exp', 'LOG': 'Math.log', 'SQR': 'Math.sqrt', 'ABS': 'Math.abs', 'SGN': 'Math.sign',
    'INT': 'Math.floor', 'RND': 'SYS.rnd', 'RAND': 'SYS.rnd',
    'LEN': '(s)=>(s+"").length', 'LEFT$': '(s,n)=>(s+"").substr(0,n)', 'RIGHT$': '(s,n)=>(s+"").substr((s+"").length-n)', 'MID$': '(s,st,ln)=>(s+"").substr(st-1,ln)',
    'STR$': '(n)=>n.toString()', 'VAL': '(s)=>{const v=parseFloat(s); return isNaN(v)?0:v;}',
    'ASC': '(s)=>(s+"").charCodeAt(0)', 'CHR$': '(n)=>String.fromCharCode(n)',
    'INSTR': '(...a)=>{let i=1,s,sub;if(a.length===3){i=a[0];s=a[1];sub=a[2]}else{s=a[0];sub=a[1]} if(s===undefined||sub===undefined)return 0; return (s+"").indexOf(sub,i-1)+1;}',
    'GR_CANVAS': 'GRAPHICS.createCanvas', 'GR_GET_CANVAS': 'GRAPHICS.getCanvas', 'GR_CANVAS_WIDTH': 'GRAPHICS.getCanvasWidth', 'GR_CANVAS_HEIGHT': 'GRAPHICS.getCanvasHeight',
    'GR_RGB': 'GRAPHICS.getRGBIndex'
};
