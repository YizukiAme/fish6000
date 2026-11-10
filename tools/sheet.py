# 把 stills/ 里的几张静帧拼成一张对照图：python tools/sheet.py 名字 35 36 37 ...  → stills/名字.jpg
import sys
from PIL import Image
out = sys.argv[1]; names = sys.argv[2:]; cols = 3 if len(names) > 4 else 2
w = 1920 // cols; h = w * 9 // 16; rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGB', (w * cols, h * rows))
for i, n in enumerate(names):
    sheet.paste(Image.open(f'stills/t_{n}.jpg').resize((w, h)), ((i % cols) * w, (i // cols) * h))
sheet.save(f'stills/{out}.jpg', quality=88)
print(f'stills/{out}.jpg')
