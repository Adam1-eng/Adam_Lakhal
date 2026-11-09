# Télécharge les polices du site (Big Shoulders, Manrope, Readex Pro) dans fonts/
import re, subprocess, os
os.makedirs('fonts', exist_ok=True)
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
css = ''
for fam in ['Big+Shoulders:wght@700;800;900', 'Manrope:wght@500;700;800', 'Readex+Pro:wght@400;600;700']:
    css += subprocess.run(['curl', '-sS', '-A', UA, f'https://fonts.googleapis.com/css2?family={fam}&display=swap'],
                          capture_output=True, text=True, check=True).stdout
out = []
for i, body in enumerate(re.findall(r'@font-face\s*{(.*?)}', css, re.S)):
    url = re.search(r'url\((.*?)\)', body).group(1)
    subprocess.run(['curl', '-sS', '-o', f'fonts/f{i}.woff2', url], check=True)
    out.append('@font-face{' + body.replace(url, f'f{i}.woff2') + '}')
open('fonts/fonts.css', 'w').write('\n'.join(out))
print(len(out), 'polices téléchargées')
