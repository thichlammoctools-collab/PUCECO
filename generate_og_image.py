import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

W, H = 1200, 630

# 1. Base Image: Create canvas
canvas = Image.new("RGBA", (W, H), (18, 19, 22, 255))

# 2. Load background image if available
bg_path = os.path.join("assets", "images", "hero-bg-1.jpg")
if os.path.exists(bg_path):
    with Image.open(bg_path) as bg:
        # Resize/crop to fill 1200x630
        bg_ratio = bg.width / bg.height
        target_ratio = W / H
        if bg_ratio > target_ratio:
            new_h = H
            new_w = int(H * bg_ratio)
        else:
            new_w = W
            new_h = int(W / bg_ratio)
        bg_resized = bg.resize((new_w, new_h), Image.Resampling.LANCZOS)
        # Center crop
        left = (new_w - W) // 2
        top = (new_h - H) // 2
        bg_cropped = bg_resized.crop((left, top, left + W, top + H)).convert("RGBA")
        
        # Slight blur and darken background
        bg_blurred = bg_cropped.filter(ImageFilter.GaussianBlur(1.2))
        enhancer = ImageEnhance.Brightness(bg_blurred)
        bg_dark = enhancer.enhance(0.40)
        
        canvas.paste(bg_dark, (0, 0))

# 3. Create gradient overlays for readability and luxury vibe
# Left-to-right gradient: very dark on left (where text is) to subtle on right
gradient = Image.new("RGBA", (W, H), (0, 0, 0, 0))
g_draw = ImageDraw.Draw(gradient)

for x in range(W):
    factor = min(1.0, max(0.0, (x - 60) / (W * 0.72)))
    alpha = int(250 * (1.0 - factor * 0.75))
    g_draw.line([(x, 0), (x, H)], fill=(16, 17, 20, alpha))

canvas = Image.alpha_composite(canvas, gradient)

# Subtle brand red decorative glow on right
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse([W - 360, H - 320, W + 100, H + 100], fill=(212, 50, 45, 55))
glow = glow.filter(ImageFilter.GaussianBlur(70))
canvas = Image.alpha_composite(canvas, glow)

# Red accent top border
accent_bar = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ab_draw = ImageDraw.Draw(accent_bar)
ab_draw.rectangle([0, 0, W, 6], fill=(212, 50, 45, 255))
canvas = Image.alpha_composite(canvas, accent_bar)

# 4. Fonts that fully support Vietnamese diacritics
font_title = ImageFont.truetype("C:/Windows/Fonts/timesbd.ttf", 46)
font_eyebrow = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 15)
font_lede = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 20)
font_badge = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 15)
font_badge_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 12)
font_footer = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 16)
font_footer_bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 16)

draw = ImageDraw.Draw(canvas)

# 5. Logo PUCECO
logo_path = os.path.join("assets", "images", "logo-puceco-white.png")
if os.path.exists(logo_path):
    with Image.open(logo_path) as logo:
        target_h = 58
        target_w = int(logo.width * (target_h / logo.height))
        logo_resized = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        canvas.paste(logo_resized, (70, 50), mask=logo_resized)

# 6. Eyebrow badge
eyebrow_text = "NGUYÊN LIỆU CHIẾT XUẤT THIÊN NHIÊN · DƯỢC LIỆU CHUẨN HÓA"
eye_x, eye_y = 70, 142
eye_pad_x, eye_pad_y = 16, 6
bbox = draw.textbbox((0, 0), eyebrow_text, font=font_eyebrow)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

pill = Image.new("RGBA", (W, H), (0, 0, 0, 0))
p_draw = ImageDraw.Draw(pill)
p_draw.rounded_rectangle(
    [eye_x, eye_y, eye_x + tw + eye_pad_x * 2, eye_y + th + eye_pad_y * 2 + 4],
    radius=6,
    fill=(212, 50, 45, 45),
    outline=(212, 50, 45, 180),
    width=1
)
canvas = Image.alpha_composite(canvas, pill)
draw = ImageDraw.Draw(canvas)
draw.text((eye_x + eye_pad_x, eye_y + eye_pad_y), eyebrow_text, font=font_eyebrow, fill=(254, 165, 165, 255))

# 7. Main Title (Two lines in Times New Roman Bold)
title_line1 = "Chiết xuất từ thiên nhiên,"
title_line2 = "tin cậy từ khoa học"
draw.text((70, 196), title_line1, font=font_title, fill=(255, 255, 255, 255))
draw.text((70, 256), title_line2, font=font_title, fill=(245, 158, 11, 255)) # amber gold highlight

# 8. Subtitle description (fits well before circle)
lede_line1 = "Nhà cung ứng nguyên liệu Dược phẩm, Mỹ phẩm & TPBVSK chuẩn hóa."
lede_line2 = "Quy trình kiểm soát chất lượng nghiêm ngặt, nguồn gốc minh bạch."
draw.text((70, 332), lede_line1, font=font_lede, fill=(225, 230, 235, 240))
draw.text((70, 368), lede_line2, font=font_lede, fill=(165, 175, 188, 220))

# 9. Trust Badges (GMP, ISO 9001, USDA Organic, 100% Thiên Nhiên, R&D)
badges = [
    ("GMP", "ĐẠT CHUẨN"),
    ("ISO 9001", "QUẢN LÝ CL"),
    ("USDA", "HỮU CƠ ORGANIC"),
    ("100%", "THIÊN NHIÊN"),
    ("R&D", "NỘI BỘ"),
]

bx = 70
by = 432
badge_h = 56

for b_main, b_sub in badges:
    b_pill = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bp_draw = ImageDraw.Draw(b_pill)
    
    mb1 = draw.textbbox((0, 0), b_main, font=font_badge)
    mb2 = draw.textbbox((0, 0), b_sub, font=font_badge_sub)
    w_text = max(mb1[2] - mb1[0], mb2[2] - mb2[0])
    bw = w_text + 28
    
    bp_draw.rounded_rectangle(
        [bx, by, bx + bw, by + badge_h],
        radius=10,
        fill=(255, 255, 255, 18),
        outline=(255, 255, 255, 45),
        width=1
    )
    canvas = Image.alpha_composite(canvas, b_pill)
    draw = ImageDraw.Draw(canvas)
    
    draw.text((bx + (bw - (mb1[2] - mb1[0])) // 2, by + 9), b_main, font=font_badge, fill=(255, 255, 255, 255))
    draw.text((bx + (bw - (mb2[2] - mb2[0])) // 2, by + 31), b_sub, font=font_badge_sub, fill=(200, 210, 220, 200))
    
    bx += bw + 14

# 10. Bottom Footer Bar (without missing glyph emojis)
foot_y = 538
draw.line([(70, foot_y), (W - 70, foot_y)], fill=(255, 255, 255, 30), width=1)

# Draw mini accent dots
def draw_dot(x, y, color=(212, 50, 45, 255)):
    draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=color)

draw_dot(75, foot_y + 32, (212, 50, 45, 255))
draw.text((88, foot_y + 22), "puceco.com", font=font_footer_bold, fill=(255, 255, 255, 240))

draw_dot(245, foot_y + 32, (245, 158, 11, 255))
draw.text((258, foot_y + 22), "Hotline: (+84) 08 272 272 59", font=font_footer, fill=(210, 220, 230, 220))

draw_dot(540, foot_y + 32, (16, 185, 129, 255))
draw.text((553, foot_y + 22), "Email: puceco2018@gmail.com", font=font_footer, fill=(210, 220, 230, 220))

draw.text((W - 275, foot_y + 22), "TP. Hồ Chí Minh, Việt Nam", font=font_footer, fill=(160, 170, 185, 200))

# 11. Right Side Visual: Circular botanical showcase
frame_w, frame_h = 330, 330
frame_x, frame_y = W - 395, 125

prod_path = os.path.join("assets", "images", "prod-curcumin.jpg")
if os.path.exists(prod_path):
    with Image.open(prod_path) as pimg:
        pimg_res = pimg.resize((frame_w, frame_h), Image.Resampling.LANCZOS).convert("RGBA")
        
        mask = Image.new("L", (frame_w, frame_h), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, frame_w, frame_h], fill=255)
        
        # Outer rings
        ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        r_draw = ImageDraw.Draw(ring)
        r_draw.ellipse([frame_x - 8, frame_y - 8, frame_x + frame_w + 8, frame_y + frame_h + 8], 
                       outline=(212, 50, 45, 140), width=3)
        r_draw.ellipse([frame_x - 18, frame_y - 18, frame_x + frame_w + 18, frame_y + frame_h + 18], 
                       outline=(217, 119, 6, 80), width=1)
        canvas = Image.alpha_composite(canvas, ring)
        
        canvas.paste(pimg_res, (frame_x, frame_y), mask=mask)

        # Highlight tag on image
        tag_box = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        tb_draw = ImageDraw.Draw(tag_box)
        tb_draw.rounded_rectangle(
            [frame_x + 65, frame_y + frame_h - 24, frame_x + frame_w - 65, frame_y + frame_h + 16],
            radius=20,
            fill=(24, 24, 27, 245),
            outline=(212, 50, 45, 220),
            width=2
        )
        canvas = Image.alpha_composite(canvas, tag_box)
        draw = ImageDraw.Draw(canvas)
        t_label = "HOẠT CHẤT CHUẨN HÓA"
        font_tag = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 13)
        tb = draw.textbbox((0, 0), t_label, font=font_tag)
        tw = tb[2] - tb[0]
        draw.text((frame_x + (frame_w - tw) // 2, frame_y + frame_h - 14), t_label, font=font_tag, fill=(255, 255, 255, 255))

# 12. Save final images
rgb_canvas = canvas.convert("RGB")
out_jpg = os.path.join("assets", "images", "og-image.jpg")
rgb_canvas.save(out_jpg, format="JPEG", quality=92, optimize=True)

out_png = os.path.join("assets", "images", "og-image.png")
canvas.save(out_png, format="PNG", optimize=True)

print(f"Generated successfully: {out_jpg} ({os.path.getsize(out_jpg)} bytes)")
print(f"Generated successfully: {out_png} ({os.path.getsize(out_png)} bytes)")
