#!/bin/bash
# Assemble l'image + le son en MP4 prêt pour TikTok / Instagram (volume normalisé à -14 LUFS)
# usage : ./mux.sh ar
L=$1
for MIX in voix sans_voix; do
  ffmpeg -y -v error -i out/${L}_image.mp4 -f f32le -ar 48000 -ac 1 -i out/${L}_mix_${MIX}.f32 \
    -filter:a "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -ac 2 \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/review_autorefaatart_${L}_${MIX}.mp4
done
ls -la out/*.mp4
