"""
Image Preprocessing & Validation Module
Handles image decode, security checks, geometry normalization, and server-side visual annotation.
"""
import io
import os
import uuid
from typing import Tuple, Optional, Dict, Any, List
from PIL import Image, ImageDraw, ImageFont

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_FORMATS = {"JPEG", "JPG", "PNG", "WEBP"}

def validate_image_bytes(image_bytes: bytes) -> Tuple[bool, Optional[str], Optional[Image.Image]]:
    """
    Validates file size, integrity, and supported image formats.
    Returns: (is_valid, error_message, PIL_Image_instance)
    """
    if not image_bytes or len(image_bytes) == 0:
        return False, "Empty image payload received.", None

    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        return False, f"Image size exceeds maximum allowed limit of {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB.", None

    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()  # Verify image header and integrity
        
        # Re-open for actual processing (verify closes stream in Pillow)
        img = Image.open(io.BytesIO(image_bytes))
        
        img_format = (img.format or "").upper()
        if img_format not in ALLOWED_FORMATS:
            return False, f"Unsupported image format '{img_format}'. Supported formats: JPG, PNG, WEBP.", None

        return True, None, img
    except Exception as e:
        return False, f"Invalid or corrupted image payload: {str(e)}", None


def normalize_image_for_inference(img: Image.Image, target_size: Tuple[int, int] = (640, 640)) -> Image.Image:
    """
    Normalizes RGB color space and resizes for neural vision inference.
    """
    if img.mode != "RGB":
        img = img.convert("RGB")
    return img.resize(target_size, Image.Resampling.BILINEAR)


def generate_annotated_image(
    original_img: Image.Image,
    detections: List[Dict[str, Any]]
) -> Image.Image:
    """
    Draws high-contrast bounding boxes, damage tags, and confidence scores
    onto a separate copy of the image without altering original evidence.
    """
    annotated = original_img.copy().convert("RGB")
    draw = ImageDraw.Draw(annotated)
    width, height = annotated.size

    for det in detections:
        bbox = det.get("bbox", {})
        # bbox normalized in percentages 0-100
        x_pct = bbox.get("x", 0)
        y_pct = bbox.get("y", 0)
        w_pct = bbox.get("width", 0)
        h_pct = bbox.get("height", 0)

        x1 = int((x_pct / 100.0) * width)
        y1 = int((y_pct / 100.0) * height)
        x2 = int(((x_pct + w_pct) / 100.0) * width)
        y2 = int(((y_pct + h_pct) / 100.0) * height)

        damage_label = det.get("damage_type", "Defect")
        conf = det.get("confidence", 0.9)
        conf_pct = int(conf * 100)
        label_text = f"{damage_label} {conf_pct}%"

        # Outline box (Lime / Warning colors)
        box_color = "#CCFF00" if conf >= 0.8 else "#FF9900" if conf >= 0.6 else "#FF3366"
        for thickness in range(3):
            draw.rectangle([x1 - thickness, y1 - thickness, x2 + thickness, y2 + thickness], outline=box_color)

        # Label background pill
        text_bbox = draw.textbbox((x1, max(0, y1 - 20)), label_text)
        pill_x1 = text_bbox[0] - 4
        pill_y1 = text_bbox[1] - 2
        pill_x2 = text_bbox[2] + 4
        pill_y2 = text_bbox[3] + 2
        draw.rectangle([pill_x1, pill_y1, pill_x2, pill_y2], fill="#111827")
        draw.text((x1, max(0, y1 - 20)), label_text, fill=box_color)

    return annotated
