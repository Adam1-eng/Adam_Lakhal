#!/bin/bash
# Assemble image + son → MP4 final (volume réglé à -14 LUFS, le standard TikTok/Instagram)
# usage : ./mux3d.sh nom_du_fichier   (ex : ./mux3d.sh review_autorefaatart_voix_ia)
NAME=${1:-review_autorefaatart}
for MIX in voix sans_voix; do
  ffmpeg -y -v error -i out/image.mp4 -f f32le -ar 48000 -ac 1 -i out/mix_${MIX}.f32 \
    -filter:a "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -ac 2 \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/${NAME}_${MIX}.mp4
done
ls -la out/*.mp4
