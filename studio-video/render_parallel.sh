#!/bin/bash
# Rendu en 2 morceaux en parallèle, puis assemblage sans perte
N=$(python3 -I -c "import json;print(round(json.load(open('timeline.json'))['total']*60))")
H=$((N/2))
F0=0 F1=$H node render3d.js video out/part1.mp4 60 > out/r1.log 2>&1 &
F0=$H F1=$N node render3d.js video out/part2.mp4 60 > out/r2.log 2>&1 &
wait
printf "file 'part1.mp4'\nfile 'part2.mp4'\n" > out/parts.txt
ffmpeg -y -v error -f concat -safe 0 -i out/parts.txt -c copy out/image.mp4
echo "fin rendu" >> out/r1.log
