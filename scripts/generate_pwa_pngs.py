import struct
import zlib
import os

def create_png(width, height, filename):
    # Generates a PNG with dark navy/slate gradient and golden lightning accent
    raw_rows = []
    
    for y in range(height):
        row = [0] # filter type 0 (None)
        ny = y / float(height)
        for x in range(width):
            nx = x / float(width)
            
            # Base dark theme background: #0b0f17 to #1e293b
            r = int(11 + 19 * ny)
            g = int(15 + 26 * ny)
            b = int(23 + 36 * ny)
            
            # Subtle rounded card effect / border
            dist_center = ((nx - 0.5)**2 + (ny - 0.5)**2)**0.5
            
            # Stylized lightning bolt in center
            # coordinates: (0.45, 0.25) to (0.35, 0.52) to (0.50, 0.52) to (0.42, 0.78) to (0.65, 0.45) to (0.52, 0.45)
            # Check bounding areas for bolt
            in_bolt = False
            if 0.22 <= ny <= 0.78 and 0.32 <= nx <= 0.68:
                if 0.22 <= ny <= 0.48:
                    # top slash
                    target_x = 0.55 - (ny - 0.22) * 0.7
                    if abs(nx - target_x) < (0.05 + 0.03 * ny):
                        in_bolt = True
                elif 0.45 <= ny <= 0.78:
                    # bottom slash
                    target_x = 0.60 - (ny - 0.45) * 0.6
                    if abs(nx - target_x) < (0.05 + 0.02 * (1 - ny)):
                        in_bolt = True
                if 0.44 <= ny <= 0.52 and 0.35 <= nx <= 0.62:
                    in_bolt = True

            if in_bolt:
                # Golden amber gradient for bolt
                r = 245 + int(10 * ny)
                g = 158 + int(30 * (1 - ny))
                b = 11
            elif dist_center > 0.47:
                # Border ring
                if dist_center < 0.49:
                    r, g, b = 51, 65, 85
                    
            row.extend([min(255, max(0, r)), min(255, max(0, g)), min(255, max(0, b)), 255])
        raw_rows.append(bytes(row))
        
    raw_data = b"".join(raw_rows)
    compressed_data = zlib.compress(raw_data)
    
    # PNG signature
    png = b"\x89PNG\r\n\x1a\n"
    
    # IHDR chunk
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b"IHDR" + ihdr)
    png += struct.pack(">I", len(ihdr)) + b"IHDR" + ihdr + struct.pack(">I", ihdr_crc)
    
    # IDAT chunk
    idat_crc = zlib.crc32(b"IDAT" + compressed_data)
    png += struct.pack(">I", len(compressed_data)) + b"IDAT" + compressed_data + struct.pack(">I", idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b"IEND")
    png += struct.pack(">I", 0) + b"IEND" + struct.pack(">I", iend_crc)
    
    with open(filename, "wb") as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

os.makedirs("public", exist_ok=True)
create_png(192, 192, "public/pwa-192x192.png")
create_png(512, 512, "public/pwa-512x512.png")
create_png(180, 180, "public/apple-touch-icon.png")
