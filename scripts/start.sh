: \
&& concurrently -k \
'BROWSER=NONE react-scripts start' \
'wait-on tcp:3000 && electron .' \
