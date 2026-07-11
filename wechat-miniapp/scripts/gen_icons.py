"""生成微信小程序 TabBar 图标 PNG"""
from PIL import Image, ImageDraw
import os

SIZE = 81
FILL_INACTIVE = '#8E8E93'
FILL_ACTIVE = '#007AFF'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'tabbar')

def make_icon(draw_fn, color):
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_fn(d, color)
    return img

def draw_house(d, c):
    """🏠 首页 — 房子"""
    # roof triangle
    d.polygon([(40, 10), (10, 38), (70, 38)], outline=c, width=3)
    # body rectangle
    d.rectangle([(20, 38), (60, 70)], outline=c, width=3)
    # door
    d.rectangle([(33, 48), (47, 70)], outline=c, width=2)

def draw_map(d, c):
    """🗺️ 灾情地图 — 定位标记"""
    r = 18
    cx, cy = 40, 35
    # pin circle
    d.ellipse([(cx - r, cy - r), (cx + r, cy + r)], outline=c, width=3)
    # pin point
    d.polygon([(cx - 8, cy + 12), (cx + 8, cy + 12), (cx, cy + 28)], fill=c)
    # center dot
    d.ellipse([(cx - 5, cy - 5), (cx + 5, cy + 5)], fill=c)

def draw_report(d, c):
    """📝 求助 — 铅笔/编辑"""
    # eraser top
    d.rectangle([(28, 8), (44, 18)], outline=c, width=2)
    # pen body
    d.rectangle([(28, 18), (52, 60)], outline=c, width=3)
    # pen tip
    d.polygon([(28, 60), (50, 60), (39, 72)], fill=c)
    # diagonal
    d.line([(28, 42), (52, 18)], fill=c, width=2)

def draw_help(d, c):
    """🤝 帮忙 — 两颗心重叠"""
    # left heart half (two arcs + triangle)
    w = SIZE
    # left lobe
    d.ellipse([(8, 14), (34, 40)], outline=c, width=3)
    # right lobe
    d.ellipse([(26, 14), (52, 40)], outline=c, width=3)
    # bottom triangle
    d.polygon([(8, 28), (52, 28), (30, 66)], outline=c, width=3)

def draw_profile(d, c):
    """📋 我的 — 人物轮廓"""
    cx = 40
    # head circle
    d.ellipse([(cx - 12, 8), (cx + 12, 32)], outline=c, width=3)
    # body arc
    d.arc([(cx - 20, 28), (cx + 20, 72)], 0, 180, fill=c, width=3)

ICONS = {
    'home': draw_house,
    'map': draw_map,
    'report': draw_report,
    'help': draw_help,
    'profile': draw_profile,
}

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, fn in ICONS.items():
        # inactive (gray)
        img_gray = make_icon(fn, FILL_INACTIVE)
        img_gray.save(os.path.join(OUT_DIR, f'{name}.png'))
        # active (blue)
        img_blue = make_icon(fn, FILL_ACTIVE)
        img_blue.save(os.path.join(OUT_DIR, f'{name}-active.png'))
        print(f'  ✓ {name}.png / {name}-active.png')

if __name__ == '__main__':
    print('Generating tabbar icons...')
    main()
    print('Done!')
