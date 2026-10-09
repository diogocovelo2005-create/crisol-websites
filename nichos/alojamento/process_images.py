import os
from PIL import Image, ImageEnhance

def process_image(input_path, output_path, scale_factor=2):
    try:
        # Open image
        img = Image.open(input_path).convert('RGB')
        
        # 1. Upscale (High Quality Lanczos)
        new_size = (int(img.width * scale_factor), int(img.height * scale_factor))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # 2. Slight color adjustments for a "warm rustic" filter
        # Increase brightness slightly
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.05)
        
        # Increase color/saturation slightly
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.15)
        
        # Apply a very slight warm tint
        # Split channels
        r, g, b = img.split()
        
        # Increase red slightly, decrease blue slightly to warm it up
        r = r.point(lambda i: min(255, int(i * 1.05)))
        g = g.point(lambda i: min(255, int(i * 1.02)))
        b = b.point(lambda i: int(i * 0.95))
        
        # Merge back
        img = Image.merge('RGB', (r, g, b))
        
        # Save output
        img.save(output_path, quality=95)
        print(f"Processed: {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

# Paths
twin_in = r"C:\Users\Diogo Covelo\Desktop\crisol-websites\nichos\alojamento\casas\quinta-de-canhoes\pesquisa\fotos\126944926.jpg"
twin_out = r"C:\Users\Diogo Covelo\Desktop\crisol-websites\nichos\alojamento\casas\quinta-de-canhoes\site\public\fotos\quartos\quarto twinn\wc-twin-filt.jpg"

duplo_in = r"C:\Users\Diogo Covelo\Downloads\18a84f9a-6d65-4df8-a48d-5cbb67ff44b2.jpg"
duplo_out = r"C:\Users\Diogo Covelo\Desktop\crisol-websites\nichos\alojamento\casas\quinta-de-canhoes\site\public\fotos\quartos\quarto duplo\wc-duplo-filt.jpg"

# Process
process_image(twin_in, twin_out)
process_image(duplo_in, duplo_out)

