import os
from PIL import Image, ImageEnhance, ImageFilter

base_dir = r"C:\Users\Diogo Covelo\Desktop\crisol-websites\nichos\alojamento\casas\quinta-de-canhoes\site\public\fotos"

def process_image(filename, action="naturalize", scale=1.0):
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        print(f"Not found: {filename}")
        return
        
    img = Image.open(filepath)
    
    # Upscale if requested
    if scale > 1.0:
        new_size = (int(img.width * scale), int(img.height * scale))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Apply specific treatments
    if action == "reduce_artificial":
        # Pool/Terraco were too saturated and artificial
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(0.85) # reduce saturation
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(0.92) # reduce hard contrast
        
    elif action == "add_life":
        # Alpendre was too dry/flat
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.15) # boost color
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.05) # slight lift
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.05)
        
    elif action == "match_rustic":
        # The new photos (canhoesacasa) to match the vibe
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(0.9) # slight desat for rustic film look
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(0.95)
        
    # Apply a gentle unsharp mask to all for "cinematic / high resolution" feel
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=100, threshold=3))
    
    # Save back
    # backup original just in case
    # os.rename(filepath, filepath + ".bak")
    img.save(filepath, quality=90)
    print(f"Processed {filename} with action {action}")

# Process specific images
process_image("terraco-piscina.jpg", "reduce_artificial")
process_image("tanque.jpg", "reduce_artificial")
process_image("dia-alpendre.jpg", "add_life", scale=1.5)
process_image("mesas-patio.jpg", "add_life")
process_image("canhoesacasa2.jpg", "match_rustic", scale=1.2)
process_image("canhoesacasa3.jpg", "match_rustic", scale=1.2)

print("Done")
